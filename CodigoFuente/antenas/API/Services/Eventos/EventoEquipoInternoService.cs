using API.DataSchema;
using API.DataSchema.DTO.Eventos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public class EventoEquipoInternoService : IEventoEquipoInternoService
    {
        private readonly DataContext _context;

        public EventoEquipoInternoService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<EventoEquipoInternoDTO>> GetAsync(long idEvento, long idUsuarioSolicitante, short idIdioma)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var result = await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join u in _context.Set<ef_usuarios>().AsNoTracking()
                    on eu.id_usuario equals u.id_usuario
                join r in _context.Set<ef_roles>().AsNoTracking()
                    on eu.id_rol equals r.id_rol
                where eu.id_evento == idEvento
                      && eu.id_usuario != null
                orderby eu.activo descending, r.orden_ui, u.nombre, u.apellido
                select new EventoEquipoInternoDTO
                {
                    id_evento_usuario = eu.id_evento_usuario,
                    id_evento = eu.id_evento,
                    id_usuario = eu.id_usuario!.Value,
                    nombre = u.nombre,
                    apellido = u.apellido,
                    email = u.email,
                    id_rol = eu.id_rol,
                    codigo_rol = r.codigo,
                    rol_texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "ROL_NOMBRE" &&
                            tr.id_item == r.id_rol &&
                            tr.id_idioma == idIdioma &&
                            tr.activo)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? r.codigo,
                    activo = eu.activo,
                    fecha_alta = eu.fecha_alta
                }
            ).ToListAsync();

            return result;
        }

        public async Task<EventoEquipoInternoDTO> AddAsync(long idEvento, AddEventoEquipoInternoRequest req, long idUsuarioSolicitante, short idIdioma)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            if (string.IsNullOrWhiteSpace(req.email))
                throw new InvalidOperationException("Debe indicar email.");

            var email = req.email.Trim().ToLowerInvariant();

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                throw new KeyNotFoundException("Evento inexistente.");

            var usuario = await _context.Set<ef_usuarios>()
                .SingleOrDefaultAsync(x => x.email.ToLower() == email);

            if (usuario == null)
                throw new KeyNotFoundException("No existe un usuario con ese email.");

            if (evento.id_cuenta.HasValue)
            {
                bool perteneceCuenta = await _context.Set<ef_cuenta_usuarios>()
                    .AnyAsync(x =>
                        x.id_cuenta == evento.id_cuenta.Value &&
                        x.id_usuario == usuario.id_usuario &&
                        x.activo);

                if (!perteneceCuenta)
                    throw new InvalidOperationException("El usuario no pertenece a la cuenta del evento.");
            }

            var rol = await _context.Set<ef_roles>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x =>
                    x.id_rol == req.id_rol &&
                    x.activo &&
                    x.asignable_equipo_evento &&
                    x.requiere_usuario);

            if (rol == null)
                throw new InvalidOperationException("Rol inválido para equipo interno.");

            if (rol.aplica_tipo_operacion != "AMBOS" && rol.aplica_tipo_operacion != evento.tipo_operacion)
                throw new InvalidOperationException("El rol no aplica al tipo de operación del evento.");

            bool existe = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_usuario == usuario.id_usuario &&
                    x.id_rol == req.id_rol);

            if (existe)
                throw new InvalidOperationException("Ese usuario ya tiene asignado ese rol en el evento.");

            var item = new ef_evento_usuarios
            {
                id_evento = idEvento,
                id_usuario = usuario.id_usuario,
                id_staff = null,
                id_rol = req.id_rol,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Set<ef_evento_usuarios>().Add(item);
            await _context.SaveChangesAsync();

            var rolTexto = await _context.Set<ef_param_traducciones>()
                .Where(tr =>
                    tr.entidad == "ROL_NOMBRE" &&
                    tr.id_item == rol.id_rol &&
                    tr.id_idioma == idIdioma &&
                    tr.activo)
                .Select(tr => tr.texto)
                .FirstOrDefaultAsync();

            return new EventoEquipoInternoDTO
            {
                id_evento_usuario = item.id_evento_usuario,
                id_evento = item.id_evento,
                id_usuario = usuario.id_usuario,
                nombre = usuario.nombre,
                apellido = usuario.apellido,
                email = usuario.email,
                id_rol = item.id_rol,
                codigo_rol = rol.codigo,
                rol_texto = rolTexto ?? rol.codigo,
                activo = item.activo,
                fecha_alta = item.fecha_alta
            };
        }

        public async Task SetActivoAsync(long idEvento, long idEventoUsuario, UpdateEventoEquipoInternoRequest req, long idUsuarioSolicitante)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var item = await _context.Set<ef_evento_usuarios>()
                .SingleOrDefaultAsync(x =>
                    x.id_evento_usuario == idEventoUsuario &&
                    x.id_evento == idEvento &&
                    x.id_usuario != null);

            if (item == null)
                throw new KeyNotFoundException("Miembro del equipo inexistente.");

            var rol = await _context.Set<ef_roles>()
                .AsNoTracking()
                .SingleOrDefaultAsync(r => r.id_rol == item.id_rol);

            if (rol != null && rol.codigo == "EVENT_OWNER" && req.activo == false)
                throw new InvalidOperationException("No se puede inactivar al owner del evento/programa.");

            item.activo = req.activo;
            item.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(long idEvento, long idEventoUsuario, long idUsuarioSolicitante)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var item = await _context.Set<ef_evento_usuarios>()
                .SingleOrDefaultAsync(x =>
                    x.id_evento_usuario == idEventoUsuario &&
                    x.id_evento == idEvento &&
                    x.id_usuario != null);

            if (item == null)
                throw new KeyNotFoundException("Miembro del equipo inexistente.");

            var rol = await _context.Set<ef_roles>()
                .AsNoTracking()
                .SingleOrDefaultAsync(r => r.id_rol == item.id_rol);

            if (rol != null && rol.codigo == "EVENT_OWNER")
                throw new InvalidOperationException("No se puede quitar al owner del evento/programa.");

            _context.Set<ef_evento_usuarios>().Remove(item);
            await _context.SaveChangesAsync();
        }

        private async Task ValidarAccesoEventoAsync(long idEvento, long idUsuario)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_usuario == idUsuario &&
                    x.activo);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tenés acceso a este evento.");
        }
    }
}