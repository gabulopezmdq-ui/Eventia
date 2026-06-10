using API.DataSchema;
using API.Services.Portal;
using API.Services.Features.Sections;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Services.Features;
using API.DataSchema.DTO.Features;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("evento_portal_config")]
    public class evento_portal_configController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly PortalContextResolver _contextResolver;
        private readonly PortalSectionDataResolver _sectionResolver;
        private readonly PortalSeguridadService _portalSeguridadService;

        public evento_portal_configController(
            DataContext context,
            PortalContextResolver contextResolver,
            PortalSectionDataResolver sectionResolver,
            PortalSeguridadService portalSeguridadService)
        {
            _context = context;
            _contextResolver = contextResolver;
            _sectionResolver = sectionResolver;
            _portalSeguridadService = portalSeguridadService;
        }

        // GET /evento_portal_config/{tokenConsulta}?idIdioma=1
        [HttpGet("{tokenConsulta}")]
        public async Task<ActionResult<List<EventoPortalConfigSeccionDTO>>> GetSecciones(
            string tokenConsulta,
            [FromQuery] int idIdioma = 1)
        {
            var context = await _contextResolver.ResolveAsync(tokenConsulta);

            if (context == null)
                return NotFound("Token inválido o expirado.");

            var secciones = await GetSeccionesResueltasAsync(context, idIdioma);

            return Ok(secciones);
        }

        // GET /evento_portal_config/full/{tokenConsulta}?idIdioma=1
        [HttpGet("full/{tokenConsulta}")]
        public async Task<ActionResult<EventoPortalFullDTO>> GetFull(
            string tokenConsulta,
            [FromQuery] int idIdioma = 1)
        {
            var context = await _contextResolver.ResolveAsync(tokenConsulta);

            if (context == null)
                return NotFound("Token inválido o expirado.");

            var secciones = await GetSeccionesResueltasAsync(context, idIdioma);

            var desbloqueadoSensible =
                await _portalSeguridadService.EstaDesbloqueadoAsync(tokenConsulta);

            var data = new Dictionary<string, object?>();

            foreach (var seccion in secciones)
            {
                bool requiereDesbloqueo = RequiereDesbloqueo(seccion.codigo);

                if (requiereDesbloqueo && !desbloqueadoSensible)
                {
                    data[ToCamelKey(seccion.codigo)] = null;
                    continue;
                }

                data[ToCamelKey(seccion.codigo)] =
                    await _sectionResolver.GetDataAsync(
                        seccion.codigo,
                        context,
                        idIdioma,
                        desbloqueadoSensible);
            }

            return Ok(new EventoPortalFullDTO
            {
                token_consulta = context.TokenConsulta,
                tipo_portal = context.TipoPortal,
                id_evento = context.IdEvento,
                id_invitado = context.IdInvitado,
                id_acceso = context.IdAcceso,
                id_rsvp_grupo = context.IdRsvpGrupo,
                id_inscripcion = context.IdInscripcion,
                secciones = secciones,
                data = data
            });
        }

        private async Task<List<EventoPortalConfigSeccionDTO>> GetSeccionesResueltasAsync(
            PortalContextDTO context,
            int idIdioma)
        {
            bool esPrograma = context.EsPrograma;

            var featuresActivas = await (
                from ef in _context.ef_evento_features.AsNoTracking()
                join f in _context.ef_param_features.AsNoTracking()
                    on ef.id_feature equals f.id_feature
                join v0 in _context.ef_evento_feature_visibilidad.AsNoTracking()
                    on new { ef.id_evento, ef.id_feature }
                    equals new { v0.id_evento, v0.id_feature } into gj
                from v in gj.DefaultIfEmpty()
                where ef.id_evento == context.IdEvento
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
                join t0 in _context.ef_param_traducciones.AsNoTracking()
                    on new
                    {
                        entidad = "PORTAL_SECCION",
                        id_item = (long)s.id_portal_seccion,
                        id_idioma = (short)idIdioma
                    }
                    equals new
                    {
                        entidad = t0.entidad,
                        id_item = t0.id_item,
                        id_idioma = t0.id_idioma
                    }
                    into gjT
                from t in gjT.DefaultIfEmpty()
                where pc.id_evento == context.IdEvento
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
                    pc.config_json,
                    traduccion = t != null ? t.texto : null
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
                        : (!string.IsNullOrWhiteSpace(s.traduccion) ? s.traduccion : s.descripcion),
                    orden = s.orden,
                    visible = s.visible,
                    requiere_feature_codigo = s.requiere_feature_codigo,
                    config_json = s.config_json == null ? null : s.config_json.ToString()
                });
            }

            return result;
        }

        private bool RequiereDesbloqueo(string codigo)
        {
            return codigo == "SALUD"
                || codigo == "QRS_RETIRO"
                || codigo == "RETIROS"
                || codigo == "FOTOS"
                || codigo == "AUTORIZACIONES"
                || codigo == "DOCUMENTOS";
        }

        private string ToCamelKey(string codigo)
        {
            switch (codigo)
            {
                case "RESUMEN": return "resumen";
                case "AGENDA": return "agenda";
                case "NOVEDADES": return "novedades";
                case "REGALOS": return "regalos";
                case "PARTICIPANTES": return "participantes";
                case "PAGOS": return "pagos";
                case "SALUD": return "salud";
                case "QRS_RETIRO": return "qrsRetiro";
                case "RETIROS": return "retiros";
                case "SALUD_ACCIONES": return "saludAcciones";
                case "AUTORIZACIONES": return "autorizaciones";
                case "FOTOS": return "fotos";
                case "HOSPEDAJES": return "hospedajes";
                case "TRANSPORTE": return "transporte";
                case "SERVICIOS": return "servicios";
                case "LIVE": return "live";
                default: return codigo.ToLower();
            }
        }
    }
}