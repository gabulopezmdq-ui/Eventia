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

        public async Task<List<AutorizacionDTO>> CreateFromPersonalLinkAsync(
            string rsvpToken,
            AutorizacionFromPersonalLinkDTO dto)
        {
            // Log 1: Verificar que encontramos al titular
            var titular = await _context.Set<ef_invitados>()
                .SingleOrDefaultAsync(x => x.rsvp_token == rsvpToken);

            if (titular == null)
                throw new ArgumentException("Link inválido.");

            // Log 2: Ver datos del titular
            Console.WriteLine($"Titular encontrado: Id={titular.id_invitado}, Grupo={titular.id_rsvp_grupo}");

            // Buscar el rol_evento del titular en el grupo
            var rol = await _context.Set<ef_rsvp_grupo_integrantes>()
                .Where(x => x.id_rsvp_grupo == titular.id_rsvp_grupo
                         && x.id_invitado == titular.id_invitado)
                .Select(x => x.rol_evento)
                .FirstOrDefaultAsync();

            // Log 3: Ver qué rol_evento tiene el titular
            Console.WriteLine($"Rol_evento del titular: {rol}");

            if (rol != "R")
                throw new InvalidOperationException("Solo el responsable puede agregar autorizados.");

            // Log 4: Ver menores del grupo
            var menores = await _context.Set<ef_rsvp_grupo_integrantes>()
                .Where(x => x.id_rsvp_grupo == titular.id_rsvp_grupo
                         && x.rol_evento == "N")
                .Select(x => x.id_invitado)
                .ToListAsync();

            Console.WriteLine($"Menores encontrados: {menores.Count}");

            if (!menores.Any())
                throw new InvalidOperationException("No hay menores en el grupo.");

            var tel = PhoneUtilHelper.NormalizeE164(dto.TelefonoAutorizado, "AR");

            var autorizaciones = new List<ef_autorizaciones>();

            foreach (var idMenor in menores)
            {
                autorizaciones.Add(new ef_autorizaciones
                {
                    id_evento = titular.id_evento,
                    id_invitado_objetivo = idMenor,
                    tipo = "R",
                    nombre_autorizado = dto.NombreAutorizado,
                    telefono_autorizado = tel,
                    relacion = dto.Relacion,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                });
            }

            _context.AddRange(autorizaciones);
            await _context.SaveChangesAsync();

            return autorizaciones.Select(ent => new AutorizacionDTO
            {
                IdAutorizacion = ent.id_autorizacion,
                IdEvento = ent.id_evento,
                IdInvitadoObjetivo = ent.id_invitado_objetivo,
                Tipo = ent.tipo,
                NombreAutorizado = ent.nombre_autorizado,
                TelefonoAutorizado = ent.telefono_autorizado,
                Relacion = ent.relacion,
                Activo = ent.activo
            }).ToList();
        }
    }
}