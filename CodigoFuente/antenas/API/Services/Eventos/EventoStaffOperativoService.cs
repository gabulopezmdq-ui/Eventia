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
    public class EventoStaffOperativoService : IEventoStaffOperativoService
    {
        private readonly DataContext _context;
        private readonly IStaffService _staffService;

        public EventoStaffOperativoService(DataContext context, IStaffService staffService)
        {
            _context = context;
            _staffService = staffService;
        }

        public async Task<List<EventoStaffOperativoDTO>> GetAsync(long idEvento, long idUsuarioSolicitante, short idIdioma)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var result = await (
                from s in _context.Set<ef_staff>().AsNoTracking()
                join r in _context.Set<ef_roles>().AsNoTracking()
                    on s.id_rol equals r.id_rol
                where s.id_evento == idEvento
                orderby s.activo descending, r.orden_ui, s.nombre, s.apellido
                select new EventoStaffOperativoDTO
                {
                    id_staff = s.id_staff,
                    id_evento = s.id_evento,
                    id_cuenta = s.id_cuenta,
                    nombre = s.nombre,
                    apellido = s.apellido,
                    email = s.email,
                    telefono = s.telefono,
                    id_rol = s.id_rol,
                    codigo_rol = r.codigo,
                    rol_texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "ROL_NOMBRE" &&
                            tr.id_item == r.id_rol &&
                            tr.id_idioma == idIdioma &&
                            tr.activo)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? r.codigo,
                    codigo_acceso = s.codigo,
                    pantalla_inicio = r.pantalla_inicio,
                    activo = s.activo,
                    fecha_expiracion = s.fecha_expiracion,
                    fecha_uso = s.fecha_uso,
                    usos = s.usos,
                    fecha_alta = s.fecha_alta
                }
            ).ToListAsync();

            return result;
        }

        public async Task<EventoStaffOperativoDTO> AddAsync(long idEvento, AddEventoStaffOperativoRequest req, long idUsuarioSolicitante, short idIdioma)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                throw new KeyNotFoundException("Evento inexistente.");

            var rol = await _context.Set<ef_roles>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x =>
                    x.id_rol == req.id_rol &&
                    x.activo &&
                    x.asignable_staff_operativo &&
                    x.permite_codigo_staff &&
                    !x.requiere_usuario);

            if (rol == null)
                throw new InvalidOperationException("Rol inválido para staff operativo.");

            if (rol.aplica_tipo_operacion != "AMBOS" && rol.aplica_tipo_operacion != evento.tipo_operacion)
                throw new InvalidOperationException("El rol no aplica al tipo de operación del evento.");

            var creado = await _staffService.CrearStaffEventoAsync(
                idEvento,
                req.nombre ?? "Staff",
                req.apellido ?? "Operativo",
                string.IsNullOrWhiteSpace(req.email) ? $"staff_{Guid.NewGuid():N}@sinmail.local" : req.email,
                req.id_rol);

            var staff = await _context.Set<ef_staff>()
                .SingleAsync(x => x.id_staff == creado.id_staff);

            if (req.fecha_expiracion.HasValue)
            {
                staff.fecha_expiracion = req.fecha_expiracion;
            }

            if (!string.IsNullOrWhiteSpace(req.telefono))
            {
                staff.telefono = req.telefono.Trim();
            }

            if (string.IsNullOrWhiteSpace(req.email))
            {
                staff.email = null;
            }

            await _context.SaveChangesAsync();

            var rolTexto = await _context.Set<ef_param_traducciones>()
                .Where(tr =>
                    tr.entidad == "ROL_NOMBRE" &&
                    tr.id_item == rol.id_rol &&
                    tr.id_idioma == idIdioma &&
                    tr.activo)
                .Select(tr => tr.texto)
                .FirstOrDefaultAsync();

            return new EventoStaffOperativoDTO
            {
                id_staff = staff.id_staff,
                id_evento = staff.id_evento,
                id_cuenta = staff.id_cuenta,
                nombre = staff.nombre,
                apellido = staff.apellido,
                email = staff.email,
                telefono = staff.telefono,
                id_rol = staff.id_rol,
                codigo_rol = rol.codigo,
                rol_texto = rolTexto ?? rol.codigo,
                codigo_acceso = staff.codigo,
                pantalla_inicio = rol.pantalla_inicio,
                activo = staff.activo,
                fecha_expiracion = staff.fecha_expiracion,
                fecha_uso = staff.fecha_uso,
                usos = staff.usos,
                fecha_alta = staff.fecha_alta
            };
        }

        public async Task SetActivoAsync(long idEvento, long idStaff, UpdateEventoStaffOperativoRequest req, long idUsuarioSolicitante)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var item = await _context.Set<ef_staff>()
                .SingleOrDefaultAsync(x => x.id_staff == idStaff && x.id_evento == idEvento);

            if (item == null)
                throw new KeyNotFoundException("Staff operativo inexistente.");

            item.activo = req.activo;
            item.fecha_expiracion = req.fecha_expiracion;

            if (req.telefono != null)
                item.telefono = string.IsNullOrWhiteSpace(req.telefono) ? null : req.telefono.Trim();

            if (req.email != null)
                item.email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim();

            item.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(long idEvento, long idStaff, long idUsuarioSolicitante)
        {
            await ValidarAccesoEventoAsync(idEvento, idUsuarioSolicitante);

            var item = await _context.Set<ef_staff>()
                .SingleOrDefaultAsync(x => x.id_staff == idStaff && x.id_evento == idEvento);

            if (item == null)
                throw new KeyNotFoundException("Staff operativo inexistente.");

            _context.Set<ef_staff>().Remove(item);
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