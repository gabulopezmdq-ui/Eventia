using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;


namespace API.Services
{
    public class AutorizacionesService : IAutorizacionesService
    {
        private readonly DataContext _context;

        public AutorizacionesService(DataContext context)
        {
            _context = context;
        }

        public async Task<AutorizacionDTO> CreateAsync(long idEvento, AutorizacionCreateDTO dto)
        {
            // Validar invitado objetivo pertenece al evento
            var invitado = await _context.Set<ef_invitados>()
                .AsNoTracking()
                .SingleOrDefaultAsync(i => i.id_invitado == dto.IdInvitadoObjetivo && i.id_evento == idEvento);

            if (invitado == null)
                throw new ArgumentException("Invitado objetivo inexistente o no pertenece al evento.");

            // Insert
            var ent = new ef_autorizaciones
            {
                id_evento = idEvento,
                id_invitado_objetivo = dto.IdInvitadoObjetivo,
                tipo = dto.Tipo,
                nombre_autorizado = dto.NombreAutorizado,
                telefono_autorizado = dto.TelefonoAutorizado,
                relacion = dto.Relacion,
                observaciones = dto.Observaciones,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Add(ent);
            await _context.SaveChangesAsync();

            return Map(ent);
        }

        public async Task<List<AutorizacionDTO>> ListAsync(long idEvento, long idInvitadoObjetivo, string tipo)
        {
            return await _context.Set<ef_autorizaciones>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento
                            && x.id_invitado_objetivo == idInvitadoObjetivo
                            && x.tipo == tipo
                            && x.activo)
                .OrderByDescending(x => x.fecha_alta)
                .Select(x => new AutorizacionDTO
                {
                    IdAutorizacion = x.id_autorizacion,
                    IdEvento = x.id_evento,
                    IdInvitadoObjetivo = x.id_invitado_objetivo,
                    Tipo = x.tipo,
                    NombreAutorizado = x.nombre_autorizado,
                    TelefonoAutorizado = x.telefono_autorizado,
                    Relacion = x.relacion,
                    Observaciones = x.observaciones,
                    Activo = x.activo
                })
                .ToListAsync();
        }

        public async Task DisableAsync(long idEvento, long idAutorizacion)
        {
            var ent = await _context.Set<ef_autorizaciones>()
                .SingleOrDefaultAsync(x => x.id_autorizacion == idAutorizacion && x.id_evento == idEvento);

            if (ent == null) throw new KeyNotFoundException("Autorización inexistente.");

            ent.activo = false;
            ent.fecha_baja = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        private static AutorizacionDTO Map(ef_autorizaciones x) => new()
        {
            IdAutorizacion = x.id_autorizacion,
            IdEvento = x.id_evento,
            IdInvitadoObjetivo = x.id_invitado_objetivo,
            Tipo = x.tipo,
            NombreAutorizado = x.nombre_autorizado,
            TelefonoAutorizado = x.telefono_autorizado,
            Relacion = x.relacion,
            Observaciones = x.observaciones,
            Activo = x.activo
        };

        public async Task<AutorizacionDTO> UpdateAsync(long idEvento, long idAutorizacion, AutorizacionUpdateDTO dto)
        {
            var ent = await _context.Set<ef_autorizaciones>()
                .SingleOrDefaultAsync(x => x.id_autorizacion == idAutorizacion && x.id_evento == idEvento);

            if (ent == null)
                throw new KeyNotFoundException("Autorización inexistente.");

            if (!string.IsNullOrWhiteSpace(dto.NombreAutorizado))
                ent.nombre_autorizado = dto.NombreAutorizado;

            if (dto.TelefonoAutorizado != null)
            {
                var tel = PhoneUtilHelper.NormalizeE164(dto.TelefonoAutorizado, "AR");
                if (tel == null) throw new ArgumentException("Teléfono inválido.");
                ent.telefono_autorizado = tel;
            }

            if (dto.Relacion != null)
                ent.relacion = dto.Relacion;

            if (dto.Observaciones != null)
                ent.observaciones = dto.Observaciones;

            if (dto.Activo.HasValue)
                ent.activo = dto.Activo.Value;

            await _context.SaveChangesAsync();

            return new AutorizacionDTO
            {
                IdAutorizacion = ent.id_autorizacion,
                IdEvento = ent.id_evento,
                IdInvitadoObjetivo = ent.id_invitado_objetivo,
                Tipo = ent.tipo,
                NombreAutorizado = ent.nombre_autorizado,
                TelefonoAutorizado = ent.telefono_autorizado,
                Relacion = ent.relacion,
                Observaciones = ent.observaciones,
                Activo = ent.activo
            };
        }

        public async Task<AutorizacionDTO> CreateFromPersonalLinkAsync(string rsvpToken, AutorizacionFromPersonalLinkDTO dto)
        {
            var titular = await _context.Set<ef_invitados>()
                .SingleOrDefaultAsync(x => x.rsvp_token == rsvpToken);

            if (titular == null)
                throw new ArgumentException("Link inválido.");

            // Verificar que sea responsable
            var rol = await _context.Set<ef_rsvp_grupo_integrantes>()
                .Where(x => x.id_rsvp_grupo == titular.id_rsvp_grupo
                            && x.id_invitado == titular.id_invitado)
                .Select(x => x.rol_evento)
                .SingleOrDefaultAsync();

            if (rol != "R")
                throw new InvalidOperationException("Solo el responsable puede agregar autorizados.");

            // Verificar que el niño pertenezca al mismo grupo
            var esDelGrupo = await _context.Set<ef_rsvp_grupo_integrantes>()
                .AnyAsync(x => x.id_rsvp_grupo == titular.id_rsvp_grupo
                               && x.id_invitado == dto.IdInvitadoObjetivo
                               && x.rol_evento == "N");

            if (!esDelGrupo)
                throw new InvalidOperationException("El invitado objetivo no pertenece al grupo o no es menor.");

            var tel = PhoneUtilHelper.NormalizeE164(dto.TelefonoAutorizado, "AR");

            var ent = new ef_autorizaciones
            {
                id_evento = titular.id_evento,
                id_invitado_objetivo = dto.IdInvitadoObjetivo,
                tipo = "R",
                nombre_autorizado = dto.NombreAutorizado,
                telefono_autorizado = tel,
                relacion = dto.Relacion,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Add(ent);
            await _context.SaveChangesAsync();

            return new AutorizacionDTO
            {
                IdAutorizacion = ent.id_autorizacion,
                IdEvento = ent.id_evento,
                IdInvitadoObjetivo = ent.id_invitado_objetivo,
                Tipo = ent.tipo,
                NombreAutorizado = ent.nombre_autorizado,
                TelefonoAutorizado = ent.telefono_autorizado,
                Relacion = ent.relacion,
                Activo = ent.activo
            };
        }
    }
}