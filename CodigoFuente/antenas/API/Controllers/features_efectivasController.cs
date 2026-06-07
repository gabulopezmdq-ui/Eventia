using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class features_efectivasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<features_efectivasController> _logger;

        public features_efectivasController(DataContext context, ILogger<features_efectivasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("GetByEvento")]
        public async Task<ActionResult<EventoFeaturesEfectivasResponseDTO>> GetByEvento([FromQuery] long idEvento)
        {
            var evento = await _context.ef_eventos
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.id_evento == idEvento);

            if (evento == null)
                return NotFound("Evento no encontrado.");

            bool esPrograma = string.Equals(evento.tipo_operacion, "PROGRAMA", StringComparison.OrdinalIgnoreCase);

            long? idCuenta = evento.id_cuenta;
            long? idPlan = evento.id_plan;
            string scopeComercial = "EVENTO";

            if (idCuenta.HasValue)
            {
                var cuenta = await _context.ef_cuentas
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.id_cuenta == idCuenta.Value);

                if (cuenta != null && cuenta.id_plan.HasValue)
                {
                    idPlan = cuenta.id_plan;
                    scopeComercial = "CUENTA";
                }
            }

            ef_planes? plan = null;
            if (idPlan.HasValue)
            {
                plan = await _context.ef_planes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.id_plan == idPlan.Value);
            }

            var trial = await _context.ef_suscripciones
                .AsNoTracking()
                .Where(s =>
                    s.scope == scopeComercial &&
                    (
                        (scopeComercial == "EVENTO" && s.id_evento == idEvento) ||
                        (scopeComercial == "CUENTA" && s.id_cuenta == idCuenta)
                    ) &&
                    s.activo == true)
                .OrderByDescending(s => s.fecha_alta)
                .FirstOrDefaultAsync();

            var trialDto = new TrialDTO();

            if (trial != null && trial.current_period_end.HasValue)
            {
                var end = trial.current_period_end.Value;
                var seconds = (end - DateTimeOffset.UtcNow).TotalSeconds;
                var dias = (int)Math.Ceiling(seconds / 86400.0);
                if (dias < 0) dias = 0;

                trialDto.current_period_end = end;
                trialDto.dias_restantes = dias;
                trialDto.vencido = DateTimeOffset.UtcNow >= end;
            }
            else
            {
                trialDto.dias_restantes = 0;
                trialDto.vencido = false;
                trialDto.current_period_end = null;
            }

            var addonsEvento = await GetAddonsActivosAsync("EVENTO", idEvento, null);

            var addonsCuenta = new List<AddonActivoDTO>();
            if (idCuenta.HasValue)
            {
                addonsCuenta = await GetAddonsActivosAsync("CUENTA", null, idCuenta.Value);
            }

            var planFeatureIds = new HashSet<long>();
            var planOverridesByFeature = new Dictionary<long, string?>();

            if (idPlan.HasValue)
            {
                var planFeatures = await _context.ef_plan_features
                    .AsNoTracking()
                    .Where(pf => pf.id_plan == idPlan.Value && pf.activo == true)
                    .Select(pf => new
                    {
                        pf.id_feature,
                        pf.config_json_override
                    })
                    .ToListAsync();

                foreach (var pf in planFeatures)
                {
                    planFeatureIds.Add(pf.id_feature);
                    planOverridesByFeature[pf.id_feature] = pf.config_json_override;
                }
            }

            var addonEventoFeatureIds = new HashSet<long>();
            var addonCuentaFeatureIds = new HashSet<long>();
            var addonOverridesByFeature = new Dictionary<long, string?>();

            if (addonsEvento.Count > 0)
                await CargarAddonFeaturesAsync(addonsEvento, addonEventoFeatureIds, addonOverridesByFeature);

            if (addonsCuenta.Count > 0)
                await CargarAddonFeaturesAsync(addonsCuenta, addonCuentaFeatureIds, addonOverridesByFeature);

            var eventoOverridesByFeature = new Dictionary<long, string?>();
            var eventoActivosByFeature = new Dictionary<long, bool>();
            var eventoVisibilidadByFeature = new Dictionary<long, ef_evento_feature_visibilidad>();

            var eventoFeatures = await _context.ef_evento_features
                .AsNoTracking()
                .Where(ef => ef.id_evento == idEvento)
                .Select(ef => new
                {
                    ef.id_feature,
                    ef.activo,
                    ef.config_json
                })
                .ToListAsync();

            foreach (var ef in eventoFeatures)
            {
                eventoOverridesByFeature[ef.id_feature] = ef.config_json;
                eventoActivosByFeature[ef.id_feature] = ef.activo;
            }

            var eventoVisibilidad = await _context.ef_evento_feature_visibilidad
                .AsNoTracking()
                .Where(v => v.id_evento == idEvento)
                .ToListAsync();

            foreach (var v in eventoVisibilidad)
            {
                eventoVisibilidadByFeature[v.id_feature] = v;
            }

            var seedIds = new HashSet<long>();

            foreach (var id in planFeatureIds) seedIds.Add(id);
            foreach (var id in addonEventoFeatureIds) seedIds.Add(id);
            foreach (var id in addonCuentaFeatureIds) seedIds.Add(id);
            foreach (var id in eventoActivosByFeature.Keys) seedIds.Add(id);

            var allIds = await ExpandirDependenciasAsync(seedIds);

            var featureDefaults = await _context.ef_param_features
                .AsNoTracking()
                .Where(f => allIds.Contains(f.id_feature))
                .Select(f => new
                {
                    f.id_feature,
                    f.visible_acceso_evento_default,
                    f.visible_centro_evento_default,
                    f.visible_acceso_programa_default,
                    f.visible_centro_programa_default
                })
                .ToDictionaryAsync(x => x.id_feature);

            var featuresFinales = await _context.ef_param_features
                .AsNoTracking()
                .Where(f => allIds.Contains(f.id_feature) && f.activo == true)
                .Select(f => new FeatureEfectivaDTO
                {
                    id_feature = f.id_feature,
                    codigo = f.codigo,
                    nombre = f.nombre,
                    categoria = f.categoria,
                    monetizable = f.monetizable,

                    config_default = f.config_json,
                    config_plan_override = null,
                    config_addon_override = null,
                    config_evento_override = null,

                    incluida_en_plan = false,
                    incluida_por_addon = false,
                    incluida_por_addon_evento = false,
                    incluida_por_addon_cuenta = false,

                    activo_evento = null,
                    activo_resuelto = false,

                    disponible = false,
                    editable = false,

                    origen = null,
                    motivo_inactivo = null,
                    mensaje_ui = null,

                    visible_acceso = false,
                    visible_centro = false,
                    permite_acceso = false,
                    permite_centro = false
                })
                .ToListAsync();

            foreach (var fe in featuresFinales)
            {
                string? v;

                fe.incluida_en_plan = planFeatureIds.Contains(fe.id_feature);
                fe.incluida_por_addon_evento = addonEventoFeatureIds.Contains(fe.id_feature);
                fe.incluida_por_addon_cuenta = addonCuentaFeatureIds.Contains(fe.id_feature);
                fe.incluida_por_addon = fe.incluida_por_addon_evento || fe.incluida_por_addon_cuenta;

                if (planOverridesByFeature.TryGetValue(fe.id_feature, out v))
                    fe.config_plan_override = v;

                if (addonOverridesByFeature.TryGetValue(fe.id_feature, out v))
                    fe.config_addon_override = v;

                if (eventoOverridesByFeature.TryGetValue(fe.id_feature, out v))
                    fe.config_evento_override = v;

                bool permitidaComercialmente = fe.incluida_en_plan || fe.incluida_por_addon;

                bool? activoEvento = null;
                if (eventoActivosByFeature.ContainsKey(fe.id_feature))
                    activoEvento = eventoActivosByFeature[fe.id_feature];

                fe.activo_evento = activoEvento;

                eventoVisibilidadByFeature.TryGetValue(fe.id_feature, out var vis);
                featureDefaults.TryGetValue(fe.id_feature, out var defaults);

                bool defaultAcceso = esPrograma
                    ? defaults?.visible_acceso_programa_default ?? false
                    : defaults?.visible_acceso_evento_default ?? false;

                bool defaultCentro = esPrograma
                    ? defaults?.visible_centro_programa_default ?? false
                    : defaults?.visible_centro_evento_default ?? false;

                fe.permite_acceso = defaultAcceso;
                fe.permite_centro = defaultCentro;

                fe.visible_acceso = esPrograma
                    ? (vis?.visible_acceso_programa ?? defaultAcceso)
                    : (vis?.visible_acceso_evento ?? defaultAcceso);

                fe.visible_centro = esPrograma
                    ? (vis?.visible_centro_programa ?? defaultCentro)
                    : (vis?.visible_centro_evento ?? defaultCentro);

                if (!permitidaComercialmente)
                {
                    fe.disponible = false;
                    fe.editable = false;
                    fe.activo_resuelto = false;
                    fe.origen = "NO_INCLUIDA";
                    fe.motivo_inactivo = "NO_INCLUIDA";
                    fe.mensaje_ui = "Disponible contratando un addon o cambiando de plan.";

                    fe.visible_acceso = false;
                    fe.visible_centro = false;

                    continue;
                }

                fe.disponible = true;
                fe.editable = true;

                if (fe.incluida_en_plan && fe.incluida_por_addon)
                    fe.origen = "PLAN_Y_ADDON";
                else if (fe.incluida_en_plan)
                    fe.origen = "PLAN";
                else if (fe.incluida_por_addon_cuenta)
                    fe.origen = "ADDON_CUENTA";
                else if (fe.incluida_por_addon_evento)
                    fe.origen = "ADDON_EVENTO";
                else
                    fe.origen = "NO_INCLUIDA";

                if (activoEvento.HasValue)
                {
                    fe.activo_resuelto = activoEvento.Value;

                    if (!activoEvento.Value)
                    {
                        fe.motivo_inactivo = "DESACTIVADA_EN_EVENTO";
                        fe.mensaje_ui = "Desactivada para este evento.";

                        fe.visible_acceso = false;
                        fe.visible_centro = false;
                    }
                }
                else
                {
                    fe.activo_resuelto = true;
                    fe.motivo_inactivo = null;
                    fe.mensaje_ui = null;
                }
            }

            featuresFinales = featuresFinales
                .OrderBy(x => x.categoria)
                .ThenBy(x => x.codigo)
                .ToList();

            var resp = new EventoFeaturesEfectivasResponseDTO
            {
                id_evento = idEvento,
                scope_comercial = scopeComercial,
                id_cuenta = idCuenta,
                id_plan = idPlan,
                plan_codigo = plan?.codigo,
                plan_nombre = plan?.nombre,
                trial = trialDto,
                addons_evento = addonsEvento,
                addons_cuenta = addonsCuenta,
                features = featuresFinales
            };

            return Ok(resp);
        }

        private async Task<List<AddonActivoDTO>> GetAddonsActivosAsync(string scope, long? idEvento, long? idCuenta)
        {
            var now = DateTimeOffset.UtcNow;

            var query =
                from sa in _context.ef_scope_addons.AsNoTracking()
                join ad in _context.ef_addons.AsNoTracking()
                    on sa.id_addon equals ad.id_addon
                where sa.scope == scope
                      && sa.activo == true
                      && sa.estado == "ACTIVO"
                      && (sa.fecha_hasta == null || sa.fecha_hasta > now)
                select new { sa, ad };

            if (scope == "EVENTO" && idEvento.HasValue)
            {
                query = query.Where(x => x.sa.id_evento == idEvento.Value);
            }

            if (scope == "CUENTA" && idCuenta.HasValue)
            {
                query = query.Where(x => x.sa.id_cuenta == idCuenta.Value);
            }

            return await query
                .Select(x => new AddonActivoDTO
                {
                    id_scope_addon = x.sa.id_scope_addon,
                    id_addon = x.ad.id_addon,
                    codigo = x.ad.codigo,
                    nombre = x.ad.nombre,
                    estado = x.sa.estado,
                    activo = x.sa.activo,
                    fecha_desde = x.sa.fecha_desde,
                    fecha_hasta = x.sa.fecha_hasta,
                    config_override = x.sa.config_json_override
                })
                .ToListAsync();
        }

        private async Task CargarAddonFeaturesAsync(
            List<AddonActivoDTO> addons,
            HashSet<long> targetFeatureIds,
            Dictionary<long, string?> addonOverridesByFeature)
        {
            var addonIds = addons.Select(a => a.id_addon).Distinct().ToList();

            var addonFeatures = await _context.ef_addon_features
                .AsNoTracking()
                .Where(af => addonIds.Contains(af.id_addon) && af.activo == true)
                .Select(af => new
                {
                    af.id_addon,
                    af.id_feature,
                    af.config_json_override
                })
                .ToListAsync();

            foreach (var af in addonFeatures)
            {
                targetFeatureIds.Add(af.id_feature);
                addonOverridesByFeature[af.id_feature] = af.config_json_override;
            }
        }

        private async Task<HashSet<long>> ExpandirDependenciasAsync(HashSet<long> seed)
        {
            var result = new HashSet<long>(seed);
            var queue = new Queue<long>(seed);

            while (queue.Count > 0)
            {
                var current = queue.Dequeue();

                var deps = await _context.ef_param_feature_dependencias
                    .AsNoTracking()
                    .Where(d => d.id_feature == current)
                    .Select(d => d.id_feature_requiere)
                    .ToListAsync();

                foreach (var dep in deps)
                {
                    if (result.Add(dep))
                        queue.Enqueue(dep);
                }
            }

            return result;
        }
    }
}