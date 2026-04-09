using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class MesasService : IMesasService
    {
        private readonly DataContext _context;

        public MesasService(DataContext context)
        {
            _context = context;
        }

        public async Task<ef_evento_mesas> CrearMesaAsync(MesaCreateDTO dto)
        {
            var tramo = await _context.ef_evento_tramos.FindAsync(dto.id_tramo);
            if (tramo == null) throw new Exception("Tramo no encontrado");

            if (!tramo.admite_mesas)
                throw new Exception("Este tramo no admite organización por mesas.");

            var mesa = new ef_evento_mesas
            {
                id_tramo = dto.id_tramo,
                nombre = dto.nombre,
                capacidad = dto.capacidad,
                notas = dto.notas,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_mesas.Add(mesa);
            await _context.SaveChangesAsync();

            return mesa;
        }

        public async Task<List<ef_evento_mesas>> GetMesasByTramoAsync(long idTramo)
        {
            return await _context.ef_evento_mesas
                .Where(m => m.id_tramo == idTramo && m.activo)
                .ToListAsync();
        }

        public async Task<List<MesaInvitadoDetalleDTO>> GetInvitadosDisponiblesParaTramoAsync(long idTramo)
        {
            // Tramos permitidos para este tramo específico (vía id_acceso)
            var tramo = await _context.ef_evento_tramos.FindAsync(idTramo);
            if (tramo == null) throw new Exception("Tramo no encontrado");

            // Invitados que tienen acceso a este tramo
            var invitadosConAcceso = await _context.ef_invitados
                .Where(i => i.id_evento == tramo.id_evento && i.activo)
                .Where(i => _context.ef_evento_acceso_tramos
                    .Any(at => at.id_acceso == i.id_acceso && at.id_tramo == idTramo))
                .ToListAsync();

            // Quitar los que ya están en alguna mesa de este tramo
            var asignadosIds = await _context.ef_evento_mesa_invitados
                .Where(mi => mi.mesa.id_tramo == idTramo)
                .Select(mi => mi.id_invitado)
                .ToListAsync();

            var disponibles = invitadosConAcceso
                .Where(i => !asignadosIds.Contains(i.id_invitado))
                .ToList();

            // Transformar a DTO con restricciones
            var result = new List<MesaInvitadoDetalleDTO>();
            foreach (var i in disponibles)
            {
                result.Add(new MesaInvitadoDetalleDTO
                {
                    id_invitado = i.id_invitado,
                    nombre_completo = i.nombre + " " + i.apellido,
                    restricciones_alimentarias = await _context.ef_rsvp_grupo_integrantes
                        .Where(rgi => rgi.id_invitado == i.id_invitado)
                        .SelectMany(rgi => _context.ef_rsvp_integrante_restricciones
                            .Where(rir => rir.id_rsvp_grupo_integrante == rgi.id_rsvp_grupo_integrante)
                            .Select(rir => rir.ef_param_restricciones_alimentarias.codigo))
                        .ToListAsync(),
                    notas_restricciones = await _context.ef_rsvp_grupo_integrantes
                        .Where(rgi => rgi.id_invitado == i.id_invitado)
                        .Select(rgi => rgi.alimentacion_detalle)
                        .FirstOrDefaultAsync()
                });
            }

            return result;
        }

        public async Task AsignarInvitadoAMesaAsync(MesaAsignarInvitadoDTO dto)
        {
            var mesa = await _context.ef_evento_mesas
                .Include(m => m.tramo)
                .FirstOrDefaultAsync(m => m.id_mesa == dto.id_mesa);

            if (mesa == null) throw new Exception("Mesa no encontrada");

            if (!mesa.tramo.admite_mesas)
                throw new Exception("El tramo asociado a esta mesa no admite invitados en mesas.");

            var invitado = await _context.ef_invitados
                .Include(i => i.acceso)
                .ThenInclude(a => a.acceso_tramos)
                .FirstOrDefaultAsync(i => i.id_invitado == dto.id_invitado);

            if (invitado == null) throw new Exception("Invitado no encontrado");

            // Validación de acceso al tramo
            bool tieneAcceso = invitado.acceso?.acceso_tramos?
                .Any(at => at.id_tramo == mesa.id_tramo) ?? false;

            if (!tieneAcceso)
                throw new Exception("El invitado no tiene acceso al tramo de esta mesa.");

            // Validar si ya está en otra mesa de este MISMO tramo
            var existeAsignacion = await _context.ef_evento_mesa_invitados
                .AnyAsync(mi => mi.id_invitado == dto.id_invitado && mi.mesa.id_tramo == mesa.id_tramo);

            if (existeAsignacion)
                throw new Exception("El invitado ya está asignado a otra mesa en este mismo tramo.");

            var asignacion = new ef_evento_mesa_invitados
            {
                id_mesa = dto.id_mesa,
                id_invitado = dto.id_invitado,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_evento_mesa_invitados.Add(asignacion);
            await _context.SaveChangesAsync();
        }

        public async Task<List<MesaInvitadoDetalleDTO>> GetInvitadosByMesaAsync(long idMesa)
        {
            return await _context.ef_evento_mesa_invitados
                .Where(mi => mi.id_mesa == idMesa)
                .Select(mi => new MesaInvitadoDetalleDTO
                {
                    id_invitado = mi.id_invitado,
                    nombre_completo = mi.invitado.nombre + " " + mi.invitado.apellido,
                    // Información informativa de restricciones
                    restricciones_alimentarias = _context.ef_rsvp_grupo_integrantes
                        .Where(rgi => rgi.id_invitado == mi.id_invitado)
                        .SelectMany(rgi => _context.ef_rsvp_integrante_restricciones
                            .Where(rir => rir.id_rsvp_grupo_integrante == rgi.id_rsvp_grupo_integrante)
                            .Select(rir => rir.ef_param_restricciones_alimentarias.codigo))
                        .ToList(),
                    notas_restricciones = _context.ef_rsvp_grupo_integrantes
                        .Where(rgi => rgi.id_invitado == mi.id_invitado)
                        .Select(rgi => rgi.alimentacion_detalle)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        public async Task QuitarInvitadoDeMesaAsync(long idMesa, long idInvitado)
        {
            var asignacion = await _context.ef_evento_mesa_invitados
                .FirstOrDefaultAsync(mi => mi.id_mesa == idMesa && mi.id_invitado == idInvitado);

            if (asignacion == null) throw new Exception("Asignación no encontrada");

            _context.ef_evento_mesa_invitados.Remove(asignacion);
            await _context.SaveChangesAsync();
        }
    }
}
