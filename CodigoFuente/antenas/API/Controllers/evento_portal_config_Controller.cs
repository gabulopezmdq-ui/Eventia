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
    [Route("[controller]")]
    public class evento_portal_config_Controller : ControllerBase
    {
        private readonly DataContext _context;

        public evento_portal_config_Controller(DataContext context)
        {
            _context = context;
        }

        // ==========================================================
        // GET /evento_portal_config/by-evento/93?idIdioma=1
        // Para probar sin depender del token.
        // ==========================================================
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

        // ==========================================================
        // GET /evento_portal_config/{token}?idIdioma=1
        // Para que el portal consuma secciones finales por token.
        // ==========================================================
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

        private async Task<long?> ResolverIdEventoPorTokenAsync(string token)
        {
            token = token.Trim();

            // 1) Invitación privada / RSVP.
            var idEventoInvitado = await _context.ef_invitados
                .AsNoTracking()
                .Where(x =>
                    x.activo == true &&
                    x.rsvp_token == token)
                .Select(x => (long?)x.id_evento)
                .FirstOrDefaultAsync();

            if (idEventoInvitado.HasValue)
                return idEventoInvitado.Value;

            // 2) QR de invitado, por si en algún flujo se usa el QR token.
            var idEventoQr = await _context.ef_invitados
                .AsNoTracking()
                .Where(x =>
                    x.activo == true &&
                    x.qr_token == token)
                .Select(x => (long?)x.id_evento)
                .FirstOrDefaultAsync();

            if (idEventoQr.HasValue)
                return idEventoQr.Value;

            // 3) Link público / campaña / inscripción de programa.
            // Si ef_evento_acceso_links.id_evento está cargado, se usa directo.
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

            // 4) Si id_evento no está en el link, se resuelve por id_acceso.
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

            // 5) Fallback por token público del evento, si existiera.
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

            // Features activas + visibilidad centro resuelta.
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

            // Secciones configuradas para el evento.
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
                // Si la sección requiere feature, solo se muestra si esa feature está activa y visible en CENTRO.
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
                    config_json = s.config_json
                });
            }

            return result;
        }
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
}