using API.DataSchema;
using API.DataSchema.DTO.Programas;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public class ProgramasService : IProgramasService
    {
        private readonly DataContext _context;

        public ProgramasService(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetStaffAsync(long idEvento, long idUsuarioLogger)
        {
            // Validar que el usuario logueado pertenece al programa
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("El usuario no tiene permisos para ver el staff de este programa.");

            // 1) Staff activo (ya son usuarios)
            var activeStaff = await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join u in _context.Set<ef_usuarios>().AsNoTracking() on eu.id_usuario equals u.id_usuario
                join r in _context.Set<ef_roles>().AsNoTracking() on eu.id_rol equals r.id_rol
                where eu.id_evento == idEvento
                select new
                {
                    IdEventoUsuario = eu.id_evento_usuario,
                    IdEvento = eu.id_evento,
                    IdUsuario = eu.id_usuario,
                    Nombre = u.nombre,
                    Apellido = u.apellido,
                    Email = u.email,
                    IdRol = eu.id_rol,
                    CodigoRol = r.codigo,
                    Activo = eu.activo,
                    FechaAlta = eu.fecha_alta,
                    EsInvitacion = false
                }
            ).ToListAsync();

            // 2) Invitaciones pendientes (tabla ef_invitados)
            var pendingInvites = await (
                from i in _context.Set<ef_invitados>().AsNoTracking()
                join r in _context.Set<ef_roles>().AsNoTracking() on i.id_rol_staff equals r.id_rol
                where i.id_evento == idEvento && i.es_staff == true && i.activo == true && i.rsvp_estado == "P"
                select new
                {
                    IdEventoUsuario = (long)0,
                    IdEvento = i.id_evento,
                    IdUsuario = (long?)null,
                    Nombre = i.nombre,
                    Apellido = i.apellido,
                    Email = i.email,
                    IdRol = i.id_rol_staff ?? (short)0,
                    CodigoRol = r.codigo,
                    Activo = true,
                    FechaAlta = i.fecha_alta,
                    EsInvitacion = true
                }
            ).ToListAsync();

            return activeStaff.Cast<object>().Concat(pendingInvites.Cast<object>()).ToList();
        }

        public async Task<object> AddStaffAsync(long idEvento, AddProgramaStaffRequest req, long idUsuarioLogger)
        {
            // 1) Validar programa
            var ev = await _context.Set<ef_eventos>().AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null) throw new KeyNotFoundException("Programa inexistente.");
            if (ev.tipo_operacion != "PROGRAMA") throw new ArgumentException("El evento indicado no es de tipo PROGRAMA.");

            // 2) Validar permisos (simplificado por ahora)
            bool esAdmin = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!esAdmin) throw new UnauthorizedAccessException("No tiene permisos para agregar staff.");

            // 3) Buscar usuario por email
            var userToAdd = await _context.Set<ef_usuarios>()
                .SingleOrDefaultAsync(x => x.email == req.Email.Trim().ToLower());

            if (userToAdd == null)
            {
                // REGLA: Si no existe, creamos una invitacin en ef_invitados
                var invitacionExistente = await _context.Set<ef_invitados>()
                    .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.email == req.Email.Trim().ToLower() && x.es_staff == true);

                if (invitacionExistente != null)
                    throw new ArgumentException("Ya existe una invitacin pendiente para este email en este programa.");

                var invitacion = new ef_invitados
                {
                    id_evento = idEvento,
                    nombre = "Staff",
                    apellido = "Invitado",
                    email = req.Email.Trim().ToLower(),
                    es_staff = true,
                    id_rol_staff = req.IdRol,
                    rsvp_token = Guid.NewGuid().ToString().Replace("-", ""),
                    rsvp_estado = "P",
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Set<ef_invitados>().Add(invitacion);
                await _context.SaveChangesAsync();

                return new
                {
                    Message = "Invitacin de staff creada exitosamente.",
                    Email = invitacion.email,
                    Token = invitacion.rsvp_token,
                    EsInvitacion = true
                };
            }

            // 4) Verificar si ya existe en el programa
            var existing = await _context.Set<ef_evento_usuarios>()
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_usuario == userToAdd.id_usuario);

            if (existing != null)
            {
                if (existing.activo) throw new ArgumentException("El usuario ya es parte del staff de este programa.");
                
                existing.id_rol = req.IdRol;
                existing.activo = true;
                existing.fecha_alta = DateTimeOffset.UtcNow;
            }
            else
            {
                existing = new ef_evento_usuarios
                {
                    id_evento = idEvento,
                    id_usuario = userToAdd.id_usuario,
                    id_rol = req.IdRol,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };
                _context.Set<ef_evento_usuarios>().Add(existing);
            }

            await _context.SaveChangesAsync();

            var rol = await _context.Set<ef_roles>().AsNoTracking().FirstAsync(x => x.id_rol == req.IdRol);

            return new ProgramaStaffDTO
            {
                IdEventoUsuario = existing.id_evento_usuario,
                IdEvento = idEvento,
                IdUsuario = userToAdd.id_usuario,
                Nombre = userToAdd.nombre,
                Apellido = userToAdd.apellido,
                Email = userToAdd.email,
                IdRol = existing.id_rol,
                CodigoRol = rol.codigo,
                Activo = existing.activo,
                FechaAlta = existing.fecha_alta
            };
        }

        public async Task<bool> UpdateStaffAsync(long idEvento, long idEventoUsuario, UpdateProgramaStaffRequest req, long idUsuarioLogger)
        {
            var staff = await _context.Set<ef_evento_usuarios>()
                .SingleOrDefaultAsync(x => x.id_evento_usuario == idEventoUsuario && x.id_evento == idEvento);

            if (staff == null) throw new KeyNotFoundException("Registro de staff inexistente.");

            bool esAdmin = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!esAdmin) throw new UnauthorizedAccessException("No tiene permisos para modificar staff.");

            staff.id_rol = req.IdRol;
            staff.activo = req.Activo;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteStaffAsync(long idEvento, long idEventoUsuario, long idUsuarioLogger)
        {
            var staff = await _context.Set<ef_evento_usuarios>()
                .SingleOrDefaultAsync(x => x.id_evento_usuario == idEventoUsuario && x.id_evento == idEvento);

            if (staff == null) throw new KeyNotFoundException("Registro de staff inexistente.");

            bool esAdmin = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!esAdmin) throw new UnauthorizedAccessException("No tiene permisos para eliminar staff.");

            staff.activo = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> AceptarInvitacionStaffAsync(string token, long idUsuarioActual)
        {
            var invite = await _context.Set<ef_invitados>()
                .FirstOrDefaultAsync(x => x.rsvp_token == token && x.es_staff == true && x.rsvp_estado == "P" && x.activo == true);

            if (invite == null) throw new KeyNotFoundException("Invitacin invlida o ya procesada.");

            var user = await _context.Set<ef_usuarios>().AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_usuario == idUsuarioActual);

            if (user == null) throw new UnauthorizedAccessException("Usuario no encontrado.");

            // 1) Vincular al programa
            var rel = await _context.Set<ef_evento_usuarios>()
                .FirstOrDefaultAsync(x => x.id_evento == invite.id_evento && x.id_usuario == idUsuarioActual);

            if (rel == null)
            {
                rel = new ef_evento_usuarios
                {
                    id_evento = invite.id_evento,
                    id_usuario = idUsuarioActual,
                    id_rol = invite.id_rol_staff ?? (short)0,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };
                _context.Set<ef_evento_usuarios>().Add(rel);
            }
            else
            {
                rel.activo = true;
                rel.id_rol = invite.id_rol_staff ?? rel.id_rol;
            }

            // 2) Marcar invitacin como aceptada
            invite.rsvp_estado = "Y";
            invite.fecha_rsvp = DateTimeOffset.UtcNow;
            invite.activo = false; // La "sacamos" de la tabla de invitados para staff

            await _context.SaveChangesAsync();

            return new { ok = true, id_evento = invite.id_evento };
        }
    }
}
