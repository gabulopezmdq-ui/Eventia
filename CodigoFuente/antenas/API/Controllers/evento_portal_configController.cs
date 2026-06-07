using API.DataSchema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers.Portal
{
    [ApiController]
    [AllowAnonymous]
    [Route("evento_portal_config")]
    public class evento_portal_configController : ControllerBase
    {
        private readonly DataContext _context;

        public evento_portal_configController(DataContext context)
        {
            _context = context;
        }

        // GET /evento_portal_config/by-evento/93?idIdioma=1
        [HttpGet("by-evento/{idEvento}")]
        public async Task<ActionResult<List<EventoPortalConfigSeccionDTO>>> GetByEvento(
            long idEvento,
            [FromQuery] int idIdioma = 1)
        {
            var result = await GetSeccionesResueltasAsync(idEvento, idIdioma);

            if (result == null)
                return NotFound("Evento no encontrado.");

            return Ok(result);
        }

        // GET /evento_portal_config/{token}?idIdioma=1
        [HttpGet("{token}")]
        public async Task<ActionResult<List<EventoPortalConfigSeccionDTO>>> GetByToken(
            string token,
            [FromQuery] int idIdioma = 1)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Debe informar token.");

            var idEvento = await ResolverIdEventoPorTokenAsync(token);

            if (idEvento == null)
                return NotFound("Token inválido o expirado.");

            var result = await GetSeccionesResueltasAsync(idEvento.Value, idIdioma);

            if (result == null)
                return NotFound("Evento no encontrado.");

            return Ok(result);
        }

        // GET /evento_portal_config/full/{token}?idIdioma=1
        [HttpGet("full/{token}")]
        public async Task<ActionResult<EventoPortalFullDTO>> GetFullByToken(
            string token,
            [FromQuery] int idIdioma = 1)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Debe informar token.");

            var idEvento = await ResolverIdEventoPorTokenAsync(token);

            if (idEvento == null)
                return NotFound("Token inválido o expirado.");

            var result = await GetFullAsync(idEvento.Value, idIdioma);

            if (result == null)
                return NotFound("Evento no encontrado.");

            return Ok(result);
        }

        // GET /evento_portal_config/full/by-evento/93?idIdioma=1
        // Útil para probar sin token.
        [HttpGet("full/by-evento/{idEvento}")]
        public async Task<ActionResult<EventoPortalFullDTO>> GetFullByEvento(
            long idEvento,
            [FromQuery] int idIdioma = 1)
        {
            var result = await GetFullAsync(idEvento, idIdioma);

            if (result == null)
                return NotFound("Evento no encontrado.");

            return Ok(result);
        }

        private async Task<EventoPortalFullDTO?> GetFullAsync(long idEvento, int idIdioma)
        {
            var evento = await _context.ef_eventos
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .Select(x => new
                {
                    x.id_evento,
                    x.tipo_operacion,
                    x.anfitriones_texto,
                    x.saludo,
                    x.mensaje_bienvenida,
                    x.fecha_evento,
                    x.fecha_inicio,
                    x.fecha_fin,
                    x.id_idioma,
                    x.id_dress_code,
                    x.dress_code_descripcion
                })
                .FirstOrDefaultAsync();

            if (evento == null)
                return null;

            var secciones = await GetSeccionesResueltasAsync(idEvento, idIdioma);

            if (secciones == null)
                return null;

            var codigos = secciones
                .Select(x => x.codigo)
                .ToHashSet();

            var data = new EventoPortalFullDataDTO();

            if (codigos.Contains("RESUMEN"))
                data.resumen = await GetResumenAsync(idEvento, idIdioma);

            if (codigos.Contains("AGENDA"))
                data.agenda = await GetAgendaAsync(idEvento, idIdioma);

            if (codigos.Contains("NOVEDADES"))
                data.novedades = await GetNovedadesAsync(idEvento, idIdioma);

            // Slots preparados. Cuando me pases hospedajes/transporte/regalos/fotos,
            // se completan acá sin cambiar contrato del front.
            if (codigos.Contains("REGALOS"))
                data.regalos = null;

            if (codigos.Contains("HOSPEDAJES"))
                data.hospedajes = null;

            if (codigos.Contains("TRANSPORTE"))
                data.transporte = null;

            if (codigos.Contains("FOTOS"))
                data.fotos = null;

            return new EventoPortalFullDTO
            {
                id_evento = evento.id_evento,
                tipo_operacion = evento.tipo_operacion,
                id_idioma = evento.id_idioma,
                secciones = secciones,
                data = data
            };
        }

        private async Task<EventoPortalResumenDTO?> GetResumenAsync(long idEvento, int idIdioma)
        {
            var resumen = await (
                from e in _context.ef_eventos.AsNoTracking()
                join dc0 in _context.ef_dress_code.AsNoTracking()
                    on e.id_dress_code equals dc0.id_dress_code into gjDc
                from dc in gjDc.DefaultIfEmpty()
                where e.id_evento == idEvento
                select new EventoPortalResumenDTO
                {
                    id_evento = e.id_evento,
                    titulo = e.anfitriones_texto,
                    saludo = e.saludo,
                    mensaje_bienvenida = e.mensaje_bienvenida,
                    fecha_evento = e.fecha_evento,
                    fecha_inicio = e.fecha_inicio,
                    fecha_fin = e.fecha_fin,
                    tipo_operacion = e.tipo_operacion,
                    dress_code_codigo = dc != null ? dc.codigo : null,
                    dress_code_descripcion = e.dress_code_descripcion
                }
            ).FirstOrDefaultAsync();

            return resumen;
        }

        private async Task<List<EventoPortalAgendaItemDTO>> GetAgendaAsync(long idEvento, int idIdioma)
        {
            // Usa la tabla de agenda que venimos trabajando.
            // Si tu entity/campos tienen otro nombre, este es el único bloque a ajustar.
            var items = await (
                from a in _context.ef_evento_agenda.AsNoTracking()
                join t in _context.ef_param_tipos_agenda_evento.AsNoTracking()
                    on a.id_tipo_agenda_evento equals t.id_tipo_agenda_evento
                where a.id_evento == idEvento
                   && a.activo == true
                   && a.visible_publico == true
                orderby a.fecha, a.dia_semana, a.hora_inicio, a.orden
                select new EventoPortalAgendaItemDTO
                {
                    id_agenda = a.id_agenda,
                    id_tipo_agenda_evento = a.id_tipo_agenda_evento,
                    tipo_codigo = t.codigo,
                    titulo = a.titulo,
                    descripcion = a.descripcion,
                    dia_semana = a.dia_semana,
                    fecha = a.fecha,
                    hora_inicio = a.hora_inicio,
                    hora_fin = a.hora_fin,
                    orden = a.orden
                }
            ).ToListAsync();

            return items;
        }

        private async Task<List<EventoPortalNovedadItemDTO>> GetNovedadesAsync(long idEvento, int idIdioma)
        {
            var now = DateTimeOffset.UtcNow;

            var items = await (
                from n in _context.ef_evento_novedades.AsNoTracking()
                join t in _context.ef_param_tipos_novedad_evento.AsNoTracking()
                    on n.id_tipo_novedad_evento equals t.id_tipo_novedad_evento
                where n.id_evento == idEvento
                   && n.activo == true
                   && n.publicado == true
                   && (n.visible_desde == null || n.visible_desde <= now)
                   && (n.visible_hasta == null || n.visible_hasta >= now)
                orderby n.destacada descending, n.orden, n.fecha_alta descending
                select new EventoPortalNovedadItemDTO
                {
                    id_novedad = n.id_novedad,
                    id_tipo_novedad_evento = n.id_tipo_novedad_evento,
                    tipo_codigo = t.codigo,
                    titulo = n.titulo,
                    descripcion = n.descripcion,
                    importante = n.importante,
                    destacada = n.destacada,
                    orden = n.orden,
                    url_adjunto = n.url_adjunto,
                    tipo_adjunto = n.tipo_adjunto,
                    fecha_alta = n.fecha_alta
                }
            ).ToListAsync();

            return items;
        }

        private async Task<long?> ResolverIdEventoPorTokenAsync(string token)
        {
            token = token.Trim();

            var idEventoInvitado = await _context.ef_invitados
                .AsNoTracking()
                .Where(x => x.activo == true && x.rsvp_token == token)
                .Select(x => (long?)x.id_evento)
                .FirstOrDefaultAsync();

            if (idEventoInvitado.HasValue)
                return idEventoInvitado.Value;

            var idEventoQr = await _context.ef_invitados
                .AsNoTracking()
                .Where(x => x.activo == true && x.qr_token == token)
                .Select(x => (long?)x.id_evento)
                .FirstOrDefaultAsync();

            if (idEventoQr.HasValue)
                return idEventoQr.Value;

            var idEventoLinkDirecto = await _context.ef_evento_acceso_links
                .AsNoTracking()
                .Where(x =>
                    x.activo == true &&
                    x.token == token &&
                    x.id_evento > 0)
                .Select(x => x.id_evento)
                .FirstOrDefaultAsync();

            if (idEventoLinkDirecto > 0)
                return idEventoLinkDirecto;

            var idEventoLinkPorAcceso = await (
                from l in _context.ef_evento_acceso_links.AsNoTracking()
                join a in _context.ef_evento_accesos.AsNoTracking()
                    on l.id_acceso equals a.id_acceso
                where l.activo == true
                   && l.token == token
                select (long?)a.id_evento
            ).FirstOrDefaultAsync();

            if (idEventoLinkPorAcceso.HasValue)
                return idEventoLinkPorAcceso.Value;

            var idEventoPublico = await _context.ef_eventos
                .AsNoTracking()
                .Where(x => x.rsvp_public_token == token)
                .Select(x => (long?)x.id_evento)
                .FirstOrDefaultAsync();

            if (idEventoPublico.HasValue)
                return idEventoPublico.Value;

            return null;
        }

        private async Task<List<EventoPortalConfigSeccionDTO>?> GetSeccionesResueltasAsync(
            long idEvento,
            int idIdioma)
        {
            var evento = await _context.ef_eventos
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .Select(x => new
                {
                    x.id_evento,
                    x.tipo_operacion
                })
                .FirstOrDefaultAsync();

            if (evento == null)
                return null;

            bool esPrograma = string.Equals(
                evento.tipo_operacion,
                "PROGRAMA",
                StringComparison.OrdinalIgnoreCase);

            var featuresActivas = await (
                from ef in _context.ef_evento_features.AsNoTracking()
                join f in _context.ef_param_features.AsNoTracking()
                    on ef.id_feature equals f.id_feature
                join v0 in _context.ef_evento_feature_visibilidad.AsNoTracking()
                    on new { ef.id_evento, ef.id_feature }
                    equals new { v0.id_evento, v0.id_feature } into gj
                from v in gj.DefaultIfEmpty()
                where ef.id_evento == idEvento
                   && ef.activo == true
                   && f.activo == true
                select new
                {
                    f.codigo,
                    visible_centro = esPrograma
                        ? (v.visible_centro_programa ?? f.visible_centro_programa_default)
                        : (v.visible_centro_evento ?? f.visible_centro_evento_default)
                }
            ).ToListAsync();

            var featuresCentroVisibles = featuresActivas
                .Where(x => x.visible_centro == true)
                .Select(x => x.codigo)
                .ToHashSet();

            var secciones = await (
                from pc in _context.ef_evento_portal_config.AsNoTracking()
                join s in _context.ef_param_portal_secciones.AsNoTracking()
                    on pc.id_portal_seccion equals s.id_portal_seccion
                where pc.id_evento == idEvento
                   && pc.activo == true
                   && pc.visible == true
                   && s.activo == true
                   && (
                        (esPrograma && s.aplica_programa == true) ||
                        (!esPrograma && s.aplica_evento == true)
                   )
                orderby pc.orden
                select new
                {
                    s.id_portal_seccion,
                    s.codigo,
                    s.descripcion,
                    s.requiere_feature_codigo,
                    pc.visible,
                    pc.orden,
                    pc.titulo_override,
                    pc.config_json
                }
            ).ToListAsync();

            var result = new List<EventoPortalConfigSeccionDTO>();

            foreach (var s in secciones)
            {
                if (!string.IsNullOrWhiteSpace(s.requiere_feature_codigo))
                {
                    if (!featuresCentroVisibles.Contains(s.requiere_feature_codigo))
                        continue;
                }

                result.Add(new EventoPortalConfigSeccionDTO
                {
                    id_portal_seccion = s.id_portal_seccion,
                    codigo = s.codigo,
                    titulo = !string.IsNullOrWhiteSpace(s.titulo_override)
                        ? s.titulo_override
                        : s.descripcion,
                    orden = s.orden,
                    visible = s.visible,
                    requiere_feature_codigo = s.requiere_feature_codigo,
                    config_json = pcConfigToString(s.config_json)
                });
            }

            return result;
        }

        private string? pcConfigToString(object? value)
        {
            return value == null ? null : value.ToString();
        }
    }

    public class EventoPortalFullDTO
    {
        public long id_evento { get; set; }
        public string? tipo_operacion { get; set; }
        public int id_idioma { get; set; }
        public List<EventoPortalConfigSeccionDTO> secciones { get; set; } = new List<EventoPortalConfigSeccionDTO>();
        public EventoPortalFullDataDTO data { get; set; } = new EventoPortalFullDataDTO();
    }

    public class EventoPortalFullDataDTO
    {
        public EventoPortalResumenDTO? resumen { get; set; }
        public List<EventoPortalAgendaItemDTO>? agenda { get; set; }
        public List<EventoPortalNovedadItemDTO>? novedades { get; set; }

        public object? regalos { get; set; }
        public object? hospedajes { get; set; }
        public object? transporte { get; set; }
        public object? fotos { get; set; }
    }

    public class EventoPortalConfigSeccionDTO
    {
        public short id_portal_seccion { get; set; }
        public string codigo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public short orden { get; set; }
        public bool visible { get; set; }
        public string? requiere_feature_codigo { get; set; }
        public string? config_json { get; set; }
    }

    public class EventoPortalResumenDTO
    {
        public long id_evento { get; set; }
        public string? titulo { get; set; }
        public string? saludo { get; set; }
        public string? mensaje_bienvenida { get; set; }
        public DateTimeOffset? fecha_evento { get; set; }
        public DateOnly? fecha_inicio { get; set; }
        public DateOnly? fecha_fin { get; set; }
        public string? tipo_operacion { get; set; }
        public string? dress_code_codigo { get; set; }
        public string? dress_code_descripcion { get; set; }
    }

    public class EventoPortalAgendaItemDTO
    {
        public long id_agenda { get; set; }
        public long id_tipo_agenda_evento { get; set; }
        public string? tipo_codigo { get; set; }
        public string? titulo { get; set; }
        public string? descripcion { get; set; }
        public int? dia_semana { get; set; }
        public DateTime? fecha { get; set; }
        public TimeSpan? hora_inicio { get; set; }
        public TimeSpan? hora_fin { get; set; }
        public int orden { get; set; }
    }

    public class EventoPortalNovedadItemDTO
    {
        public long id_novedad { get; set; }
        public long id_tipo_novedad_evento { get; set; }
        public string? tipo_codigo { get; set; }
        public string? titulo { get; set; }
        public string? descripcion { get; set; }
        public bool importante { get; set; }
        public bool destacada { get; set; }
        public int orden { get; set; }
        public string? url_adjunto { get; set; }
        public string? tipo_adjunto { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
    }
}