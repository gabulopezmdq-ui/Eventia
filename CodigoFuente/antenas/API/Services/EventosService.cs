using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class EventosService : IEventosService
    {
        private readonly DataContext _context;

        // Debe coincidir con ef_param_traducciones.entidad
        private const string ENT_TIPO_EVENTO = "TIPO_EVENTO";
        private const string ENT_DRESS_CODE = "DRESS_CODE";

        public EventosService(DataContext context)
        {
            _context = context;
        }

        // =========================================================
        // Query base enriquecido: eventos + tipo_evento + traducción
        // =========================================================
        private IQueryable<EventoResponse> QueryEventosConTipo()
        {
            // OJO: tu ef_tipos_evento tiene: id_tipo_evento, activo, codigo
            // y ef_param_traducciones: entidad, id_item (bigint), id_idioma, texto, activo
            var q =
                from ev in _context.Set<ef_eventos>()
                join te in _context.Set<ef_tipos_evento>() on ev.id_tipo_evento equals te.id_tipo_evento

                join tr in _context.Set<ef_param_traducciones>()
                    on new
                    {
                        entidad = ENT_TIPO_EVENTO,
                        id_item = (long)ev.id_tipo_evento,
                        id_idioma = ev.id_idioma,
                        activo = true
                    }
                    equals new
                    {
                        entidad = tr.entidad,
                        id_item = tr.id_item,
                        id_idioma = tr.id_idioma,
                        activo = tr.activo
                    }
                    into trj
                from tr in trj.DefaultIfEmpty()

                    // DRESS CODE (LEFT)
                join dc in _context.Set<ef_dress_code>()
                    on ev.id_dress_code equals dc.id_dress_code into dcJ
                from dc in dcJ.DefaultIfEmpty()

                    // TRADUCCIÓN DRESS CODE (LEFT, depende de dc)
                join trDc in _context.Set<ef_param_traducciones>()
                    on new
                    {
                        entidad = ENT_DRESS_CODE,
                        id_item = (long?)dc.id_dress_code,
                        id_idioma = (short?)ev.id_idioma,
                        activo = (bool?)true
                    }
                    equals new
                    {
                        entidad = trDc.entidad,
                        id_item = (long?)trDc.id_item,
                        id_idioma = (short?)trDc.id_idioma,
                        activo = (bool?)trDc.activo
                    }
                    into trDcJ
                from trDc in trDcJ.DefaultIfEmpty()

                select new EventoResponse
                {
                    IdEvento = ev.id_evento,
                    IdTipoEvento = ev.id_tipo_evento,
                    TipoEventoCodigo = te.codigo,

                    IdIdioma = ev.id_idioma,
                    AnfitrionesTexto = ev.anfitriones_texto,
                    Estado = ev.estado,
                    FechaAlta = ev.fecha_alta,

                    IdDressCode = ev.id_dress_code,
                    DressCodeDescripcion = ev.dress_code_descripcion,
                    DressCodeTexto =
                        (trDc != null && !string.IsNullOrWhiteSpace(trDc.texto))
                            ? trDc.texto
                            : (dc != null ? dc.codigo : null),

                    Saludo = ev.saludo,
                    MensajeBienvenida = ev.mensaje_bienvenida
                };

            return q;
        }

        // =========================
        // CREAR EVENTO
        // =========================
        public async Task<EventoResponse> CrearEventoAsync(long idUsuario, EventoCreateRequest req)
        {
            if (req.IdTipoEvento <= 0)
                throw new InvalidOperationException("Tipo de evento obligatorio.");

            if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
                throw new InvalidOperationException("Anfitriones obligatorio.");

            if (req.AnfitrionesTexto.Length > 500)
                throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

            if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
                throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

            bool yaTieneBorrador = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu =>
                    eu.id_usuario == idUsuario &&
                    eu.activo == true &&
                    _context.Set<ef_eventos>().Any(ev => ev.id_evento == eu.id_evento && ev.estado == EventoEstado.Borrador));

            if (yaTieneBorrador)
                throw new InvalidOperationException("Ya tienes un evento en borrador. Activa o elimina ese evento para crear otro.");

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

            short idRolOwner = await _context.Set<ef_roles>()
                .Where(r => r.codigo == RolesCodigo.EventOwner && r.activo == true)
                .Select(r => r.id_rol)
                .SingleAsync();

            await using var tx = await _context.Database.BeginTransactionAsync();

            var now = DateTimeOffset.UtcNow;

            var evento = new ef_eventos
            {
                id_tipo_evento = req.IdTipoEvento,
                id_idioma = idIdioma,
                id_cliente = null,

                anfitriones_texto = req.AnfitrionesTexto.Trim(),

                id_dress_code = req.IdDressCode,
                dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion) ? null : req.DressCodeDescripcion.Trim(),

                saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim(),
                mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim(),
                notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim(),

                estado = EventoEstado.Borrador,
                fecha_alta = now,
                fecha_modif = null,

                es_publico = false,
                modo_acceso = "I",
                modo_asistencia = "R"
            };

            _context.Set<ef_eventos>().Add(evento);
            await _context.SaveChangesAsync();

            _context.Set<ef_evento_usuarios>().Add(new ef_evento_usuarios
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                id_rol = idRolOwner,
                fecha_alta = now,
                activo = true
            });

            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                fecha = now,
                estado = EventoEstado.Borrador,
                observaciones = null
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // DEVOLVER ENRIQUECIDO
            return await GetEventoMioAsync(idUsuario, evento.id_evento);
        }

        // =========================
        // MIS EVENTOS
        // =========================
        public async Task<List<EventoResponse>> MisEventosAsync(long idUsuario)
        {
            // seguridad por pertenencia + proyección enriquecida
            var q =
                from eu in _context.Set<ef_evento_usuarios>()
                join evDto in QueryEventosConTipo() on eu.id_evento equals evDto.IdEvento
                where eu.id_usuario == idUsuario && eu.activo == true
                select evDto;

            return await q.AsNoTracking().ToListAsync();
        }

        // =========================
        // GET EVENTO MÍO
        // =========================
        public async Task<EventoResponse> GetEventoMioAsync(long idUsuario, long idEvento)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu => eu.id_usuario == idUsuario && eu.id_evento == idEvento && eu.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tienes acceso a este evento.");

            var dto = await QueryEventosConTipo()
                .AsNoTracking()
                .SingleOrDefaultAsync(e => e.IdEvento == idEvento);

            if (dto == null)
                throw new KeyNotFoundException("Evento inexistente.");

            return dto;
        }

        // =========================
        // ADMIN: LISTAR
        // =========================
        public async Task<List<EventoResponse>> AdminListarEventosAsync(string? estado = null)
        {
            var q = QueryEventosConTipo();

            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(e => e.Estado == estado);

            return await q.AsNoTracking()
                .OrderByDescending(e => e.FechaAlta)
                .ToListAsync();
        }

        // =========================
        // ADMIN: GET
        // =========================
        public async Task<EventoResponse> AdminGetEventoAsync(long idEvento)
        {
            var dto = await QueryEventosConTipo()
                .AsNoTracking()
                .SingleOrDefaultAsync(e => e.IdEvento == idEvento);

            if (dto == null)
                throw new KeyNotFoundException("Evento inexistente.");

            return dto;
        }

        // =========================
        // ACTIVAR (ADMIN)
        // =========================
        public async Task ActivarEventoAdminAsync(long idEvento, long idUsuarioAdmin)
        {
            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            if (ev.estado != EventoEstado.Borrador)
                throw new InvalidOperationException("Solo se puede activar un evento en borrador.");

            var now = DateTimeOffset.UtcNow;

            ev.estado = EventoEstado.Activo;
            ev.fecha_modif = now;

            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = idEvento,
                id_usuario = idUsuarioAdmin,
                fecha = now,
                estado = EventoEstado.Activo,
                observaciones = "Activación manual por pago"
            });

            await _context.SaveChangesAsync();
        }

        // =========================
        // UPDATE GENERAL
        // =========================
        public async Task<EventoResponse> UpdateGeneralAsync(long idUsuario, long idEvento, EventoUpdateGeneralRequest req)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu => eu.id_usuario == idUsuario && eu.id_evento == idEvento && eu.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tienes acceso a este evento.");

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            if (req.AnfitrionesTexto != null)
            {
                if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
                    throw new InvalidOperationException("Anfitriones no puede quedar vacío.");

                if (req.AnfitrionesTexto.Length > 500)
                    throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

                ev.anfitriones_texto = req.AnfitrionesTexto.Trim();
            }

            if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
                throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

            if (req.IdDressCode.HasValue)
            {
                bool existeDress = await _context.Set<ef_dress_code>()
                    .AnyAsync(d => d.id_dress_code == req.IdDressCode.Value && d.activo == true);

                if (!existeDress)
                    throw new InvalidOperationException("El dress code no existe o está inactivo.");

                ev.id_dress_code = req.IdDressCode.Value;
                ev.dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion) ? null : req.DressCodeDescripcion.Trim();
            }
            else if (req.IdDressCode == null && req.DressCodeDescripcion != null)
            {
                ev.id_dress_code = null;
                ev.dress_code_descripcion = null;
            }

            if (req.Saludo != null)
                ev.saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim();

            if (req.MensajeBienvenida != null)
                ev.mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim();

            if (req.Notas != null)
                ev.notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim();

            ev.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            // devolver enriquecido
            return await GetEventoMioAsync(idUsuario, idEvento);
        }
    }
}