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
    public class EventosService : IEventosService
    {
        private readonly DataContext _context;

        public EventosService(DataContext context)
        {
            _context = context;
        }

        public async Task<EventoResponse> CrearEventoAsync(long idUsuario, EventoCreateRequest req)
        {
            // Validaciones base
            if (req.IdTipoEvento <= 0)
                throw new InvalidOperationException("Tipo de evento obligatorio.");

            if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
                throw new InvalidOperationException("Anfitriones obligatorio.");

            if (req.AnfitrionesTexto.Length > 500)
                throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

            if (req.Latitud.HasValue && (req.Latitud < -90 || req.Latitud > 90))
                throw new InvalidOperationException("Latitud fuera de rango (-90 a 90).");

            if (req.Longitud.HasValue && (req.Longitud < -180 || req.Longitud > 180))
                throw new InvalidOperationException("Longitud fuera de rango (-180 a 180).");

            if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
                throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

            // Regla: 1 borrador por usuario (Fase 1) 
            bool yaTieneBorrador = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu =>
                    eu.id_usuario == idUsuario &&
                    eu.activo == true &&
                    _context.Set<ef_eventos>().Any(ev => ev.id_evento == eu.id_evento && ev.estado == EventoEstado.Borrador));

            if (yaTieneBorrador)
                throw new InvalidOperationException("Ya tienes un evento en borrador. Activa o elimina ese evento para crear otro.");

            // Chequeos FK 
            bool existeTipo = await _context.Set<ef_tipos_evento>()
                .AnyAsync(t => t.id_tipo_evento == req.IdTipoEvento && t.activo == true);

            if (!existeTipo)
                throw new InvalidOperationException("El tipo de evento no existe o está inactivo.");

            short idIdioma = req.IdIdioma ?? Idiomas.DefaultIdiomaId;

            bool existeIdioma = await _context.Set<ef_idiomas>()
                .AnyAsync(i => i.id_idioma == idIdioma && i.activo == true);

            if (!existeIdioma)
                throw new InvalidOperationException("El idioma no existe o está inactivo.");

            if (req.IdDressCode.HasValue)
            {
                bool existeDress = await _context.Set<ef_dress_code>()
                    .AnyAsync(d => d.id_dress_code == req.IdDressCode.Value && d.activo == true);

                if (!existeDress)
                    throw new InvalidOperationException("El dress code no existe o está inactivo.");
            }

            // Obtener id_rol para EVENT_OWNER
            short idRolOwner = await _context.Set<ef_roles>()
                .Where(r => r.codigo == RolesCodigo.EventOwner && r.activo == true)
                .Select(r => r.id_rol)
                .SingleAsync();

            // Transacción: crear evento + vincular owner + histórico estado
            await using var tx = await _context.Database.BeginTransactionAsync();

            var now = DateTimeOffset.UtcNow;

            var evento = new ef_eventos
            {
                id_tipo_evento = req.IdTipoEvento,
                id_idioma = idIdioma,
                id_cliente = null,

                anfitriones_texto = req.AnfitrionesTexto.Trim(),
                fecha_hora = req.FechaHora,

                lugar = string.IsNullOrWhiteSpace(req.Lugar) ? null : req.Lugar.Trim(),
                direccion = string.IsNullOrWhiteSpace(req.Direccion) ? null : req.Direccion.Trim(),
                latitud = req.Latitud,
                longitud = req.Longitud,

                id_dress_code = req.IdDressCode,
                dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion) ? null : req.DressCodeDescripcion.Trim(),

                saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim(),
                mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim(),
                notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim(),

                estado = EventoEstado.Borrador,
                fecha_alta = now,
                fecha_modif = null
            };

            _context.Set<ef_eventos>().Add(evento);
            await _context.SaveChangesAsync(); // acá ya tenés evento.id_evento

            var linkOwner = new ef_evento_usuarios
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                id_rol = idRolOwner,
                fecha_alta = now,
                activo = true
            };

            var hist = new ef_evento_estados_hist
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                fecha = now,
                estado = EventoEstado.Borrador,
                observaciones = null
            };

            _context.Set<ef_evento_usuarios>().Add(linkOwner);
            _context.Set<ef_evento_estados_hist>().Add(hist);
            
            await _context.SaveChangesAsync();

            await tx.CommitAsync();

            return Map(evento);
        }

        public async Task<List<EventoResponse>> MisEventosAsync(long idUsuario)
        {
            // Solo los eventos donde el usuario tiene relación activa en ef_evento_usuarios :contentReference[oaicite:5]{index=5}
            var query =
                from eu in _context.Set<ef_evento_usuarios>()
                join ev in _context.Set<ef_eventos>() on eu.id_evento equals ev.id_evento
                where eu.id_usuario == idUsuario && eu.activo == true
                orderby ev.fecha_hora descending
                select ev;

            var eventos = await query.AsNoTracking().ToListAsync();
            return eventos.Select(Map).ToList();
        }

        public async Task<EventoResponse> GetEventoMioAsync(long idUsuario, long idEvento)
        {
            // Chequeo de seguridad por pertenencia :contentReference[oaicite:6]{index=6}
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu => eu.id_usuario == idUsuario && eu.id_evento == idEvento && eu.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tienes acceso a este evento.");

            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            return Map(ev);
        }

        private static EventoResponse Map(ef_eventos e) => new EventoResponse
        {
            IdEvento = e.id_evento,
            IdTipoEvento = e.id_tipo_evento,
            IdIdioma = e.id_idioma,
            AnfitrionesTexto = e.anfitriones_texto,
            FechaHora = e.fecha_hora,
            Lugar = e.lugar,
            Direccion = e.direccion,
            Estado = e.estado,
            FechaAlta = e.fecha_alta
        };



        public async Task<List<EventoResponse>> AdminListarEventosAsync(string? estado = null)
        {
            var q = _context.Set<ef_eventos>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(e => e.estado == estado);

            var eventos = await q.AsNoTracking()
                .OrderByDescending(e => e.fecha_alta)
                .ToListAsync();

            return eventos.Select(Map).ToList();
        }

        public async Task<EventoResponse> AdminGetEventoAsync(long idEvento)
        {
            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            return Map(ev);
        }

        public async Task ActivarEventoAdminAsync(long idEvento, long idUsuarioAdmin)
        {
            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            if (ev.estado != EventoEstado.Borrador)
                throw new InvalidOperationException("Solo se puede activar un evento en borrador.");

            var now = DateTimeOffset.UtcNow;

            //1. actualiza estado del evento
            ev.estado = EventoEstado.Activo;
            ev.fecha_modif = now;

            //2. inserta histórico
            var hist = new ef_evento_estados_hist
            {
                id_evento = idEvento,
                id_usuario = idUsuarioAdmin,          //(superadmin)
                fecha = now,
                estado = EventoEstado.Activo,
                observaciones = "Activación manual por pago"
            };


            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = idEvento,
                id_usuario = idUsuarioAdmin, //quién activó
                fecha = now,
                estado = EventoEstado.Activo,
                observaciones = "Activación manual por pago"
            });

            _context.Set<ef_evento_estados_hist>().Add(hist);

            await _context.SaveChangesAsync();
        }
    }
}