using API.DataSchema;
using API.DataSchema.DTO.Eventos;
using API.Services.Staff;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public class EventoStaffAsignacionService : IEventoStaffAsignacionService
    {
        private readonly DataContext _context;
        private readonly IStaffService _staffService;

        public EventoStaffAsignacionService(DataContext context, IStaffService staffService)
        {
            _context = context;
            _staffService = staffService;
        }

        public async Task<List<EventoStaffAsignadoDTO>> GetAsync(long idEvento, long idUsuarioSolicitante, short idIdioma)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var result = await (
                from es in _context.Set<ef_evento_staff>().AsNoTracking()
                join s in _context.Set<ef_staff>().AsNoTracking() on es.id_staff equals s.id_staff
                join r in _context.Set<ef_roles>().AsNoTracking() on es.id_rol equals r.id_rol
                where es.id_evento == idEvento
                orderby es.activo descending, r.orden_ui, s.nombre, s.apellido
                select new EventoStaffAsignadoDTO
                {
                    id_evento_staff = es.id_evento_staff,
                    id_evento = es.id_evento,
                    id_staff = s.id_staff,
                    nombre = s.nombre,
                    apellido = s.apellido,
                    email = s.email,
                    telefono = s.telefono,
                    id_rol = es.id_rol,
                    codigo_rol = r.codigo,
                    rol_texto = _context.Set<ef_param_traducciones>()
                        .Where(tr => tr.entidad == "ROL_NOMBRE" && tr.id_item == r.id_rol && tr.id_idioma == idIdioma && tr.activo)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? r.codigo,
                    pantalla_inicio = r.pantalla_inicio,
                    codigo_acceso = s.codigo,
                    activo = es.activo,
                    fecha_expiracion = s.fecha_expiracion,
                    fecha_uso = s.fecha_uso,
                    usos = s.usos,
                    fecha_alta = es.fecha_alta
                }
            ).ToListAsync();

            return result;
        }

        public async Task<EventoStaffAsignadoDTO> AddDesdeCuentaAsync(long idEvento, AddEventoStaffDesdeCuentaRequest req, long idUsuarioSolicitante, short idIdioma)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                throw new KeyNotFoundException("Evento inexistente.");

            if (!evento.id_cuenta.HasValue)
                throw new InvalidOperationException("Este evento no pertenece a una cuenta. Para B2C use 'Nuevo staff'.");

            var staff = await _context.Set<ef_staff>()
                .SingleOrDefaultAsync(x => x.id_staff == req.id_staff);

            if (staff == null)
                throw new KeyNotFoundException("Staff inexistente.");

            if (staff.id_cuenta != evento.id_cuenta.Value)
                throw new InvalidOperationException("El staff no pertenece a la cuenta del evento.");

            var rol = await ValidarRolStaffAsync(req.id_rol, evento.tipo_operacion);

            bool existe = await _context.Set<ef_evento_staff>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_staff == req.id_staff && x.id_rol == req.id_rol);

            if (existe)
                throw new InvalidOperationException("Ese staff ya tiene asignado ese rol en el evento.");

            var item = new ef_evento_staff
            {
                id_evento = idEvento,
                id_staff = req.id_staff,
                id_rol = req.id_rol,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Set<ef_evento_staff>().Add(item);
            await _context.SaveChangesAsync();

            return await MapDtoAsync(item.id_evento_staff, idIdioma);
        }

        public async Task<EventoStaffAsignadoDTO> AddNuevoAsync(long idEvento, AddEventoStaffNuevoRequest req, long idUsuarioSolicitante, short idIdioma)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var evento = await _context.Set<ef_eventos>().AsNoTracking().SingleOrDefaultAsync(x => x.id_evento == idEvento);
            if (evento == null) throw new KeyNotFoundException("Evento inexistente.");

            var rol = await ValidarRolStaffAsync(req.id_rol, evento.tipo_operacion);

            var creado = await _staffService.CrearStaffEventoAsync(
                idEvento,
                req.nombre,
                req.apellido,
                string.IsNullOrWhiteSpace(req.email) ? $"staff_{Guid.NewGuid():N}@sinmail.local" : req.email,
                req.id_rol);

            var staff = await _context.Set<ef_staff>().SingleAsync(x => x.id_staff == creado.id_staff);

            if (req.fecha_expiracion.HasValue)
                staff.fecha_expiracion = req.fecha_expiracion;

            if (!string.IsNullOrWhiteSpace(req.telefono))
                staff.telefono = req.telefono.Trim();

            if (string.IsNullOrWhiteSpace(req.email))
                staff.email = null;

            await _context.SaveChangesAsync();

            var item = new ef_evento_staff
            {
                id_evento = idEvento,
                id_staff = staff.id_staff,
                id_rol = req.id_rol,
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Set<ef_evento_staff>().Add(item);
            await _context.SaveChangesAsync();

            return await MapDtoAsync(item.id_evento_staff, idIdioma);
        }

        public async Task SetActivoAsync(long idEvento, long idEventoStaff, UpdateEventoStaffAsignadoRequest req, long idUsuarioSolicitante)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var item = await _context.Set<ef_evento_staff>()
                .SingleOrDefaultAsync(x => x.id_evento_staff == idEventoStaff && x.id_evento == idEvento);

            if (item == null)
                throw new KeyNotFoundException("Asignación de staff inexistente.");

            item.activo = req.activo;
            item.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(long idEvento, long idEventoStaff, long idUsuarioSolicitante)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var item = await _context.Set<ef_evento_staff>()
                .SingleOrDefaultAsync(x => x.id_evento_staff == idEventoStaff && x.id_evento == idEvento);

            if (item == null)
                throw new KeyNotFoundException("Asignación de staff inexistente.");

            _context.Set<ef_evento_staff>().Remove(item);
            await _context.SaveChangesAsync();
        }

        private async Task<EventoStaffAsignadoDTO> MapDtoAsync(long idEventoStaff, short idIdioma)
        {
            var dto = await (
                from es in _context.Set<ef_evento_staff>().AsNoTracking()
                join s in _context.Set<ef_staff>().AsNoTracking() on es.id_staff equals s.id_staff
                join r in _context.Set<ef_roles>().AsNoTracking() on es.id_rol equals r.id_rol
                where es.id_evento_staff == idEventoStaff
                select new EventoStaffAsignadoDTO
                {
                    id_evento_staff = es.id_evento_staff,
                    id_evento = es.id_evento,
                    id_staff = s.id_staff,
                    nombre = s.nombre,
                    apellido = s.apellido,
                    email = s.email,
                    telefono = s.telefono,
                    id_rol = es.id_rol,
                    codigo_rol = r.codigo,
                    rol_texto = _context.Set<ef_param_traducciones>()
                        .Where(tr => tr.entidad == "ROL_NOMBRE" && tr.id_item == r.id_rol && tr.id_idioma == idIdioma && tr.activo)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? r.codigo,
                    pantalla_inicio = r.pantalla_inicio,
                    codigo_acceso = s.codigo,
                    activo = es.activo,
                    fecha_expiracion = s.fecha_expiracion,
                    fecha_uso = s.fecha_uso,
                    usos = s.usos,
                    fecha_alta = es.fecha_alta
                }
            ).SingleAsync();

            return dto;
        }

        private async Task<ef_roles> ValidarRolStaffAsync(short idRol, string? tipoOperacion)
        {
            var rol = await _context.Set<ef_roles>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x =>
                    x.id_rol == idRol &&
                    x.activo &&
                    x.asignable_staff_operativo &&
                    x.permite_codigo_staff &&
                    !x.requiere_usuario);

            if (rol == null)
                throw new InvalidOperationException("Rol inválido para staff operativo.");

            if (rol.aplica_tipo_operacion != "AMBOS" && rol.aplica_tipo_operacion != tipoOperacion)
                throw new InvalidOperationException("El rol no aplica al tipo de operación del evento.");

            return rol;
        }

        private async Task ValidarAccesoEventoAsync(long idEvento, long idUsuario)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tenés acceso a este evento.");
        }
    }
}