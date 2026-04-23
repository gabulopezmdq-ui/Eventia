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
    //[Authorize(Roles = "SUPERADMIN")]
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

        /// <summary>
        /// Devuelve features efectivas (plan + addons EVENTO + addons CUENTA (si aplica) + overrides + dependencias + estado del evento) y trial restante.
        /// Este endpoint es el que debe usar el front para pintar la pantalla "Características".
        /// </summary>
        [HttpGet("GetByEvento")]
        public async Task<ActionResult<EventoFeaturesEfectivasResponseDTO>> GetByEvento([FromQuery] long idEvento)
        {
            // 1) Evento y plan
            var evento = await _context.ef_eventos
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.id_evento == idEvento);

            if (evento == null)
                return NotFound("Evento no encontrado.");

            long? idPlan = evento.id_plan;

            ef_planes? plan = null;
            if (idPlan.HasValue)
            {
                plan = await _context.ef_planes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.id_plan == idPlan.Value);
            }

            // 2) Trial (última suscripción activa de evento)
            var trial = await _context.ef_suscripciones
                .AsNoTracking()
                .Where(s => s.scope == "EVENTO" && s.id_evento == idEvento && s.activo == true)
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

            // 3) Add-ons activos por EVENTO (vigentes)
            var addonsEventoSolo = await (
                from sa in _context.ef_scope_addons.AsNoTracking()
                join ad in _context.ef_addons.AsNoTracking()
                    on sa.id_addon equals ad.id_addon
                where sa.scope == "EVENTO"
                      && sa.id_evento == idEvento
                      && sa.activo == true
                      && sa.estado == "ACTIVO"
                      && (sa.fecha_hasta == null || sa.fecha_hasta > DateTimeOffset.UtcNow)
                select new AddonActivoDTO
                {
                    id_scope_addon = sa.id_scope_addon,
                    id_addon = ad.id_addon,
                    codigo = ad.codigo,
                    nombre = ad.nombre,
                    estado = sa.estado,
                    activo = sa.activo,
                    fecha_desde = sa.fecha_desde,
                    fecha_hasta = sa.fecha_hasta,
                    config_override = sa.config_json_override
                }
            ).ToListAsync();

            // 3b) Add-ons activos por CUENTA (si el evento es B2B)
            var addonsCuenta = new List<AddonActivoDTO>();
            if (evento.id_cuenta.HasValue)
            {
                long idCuenta = evento.id_cuenta.Value;

                addonsCuenta = await (
                    from sa in _context.ef_scope_addons.AsNoTracking()
                    join ad in _context.ef_addons.AsNoTracking()
                        on sa.id_addon equals ad.id_addon
                    where sa.scope == "CUENTA"
                          && sa.id_cuenta == idCuenta
                          && sa.activo == true
                          && sa.estado == "ACTIVO"
                          && (sa.fecha_hasta == null || sa.fecha_hasta > DateTimeOffset.UtcNow)
                    select new AddonActivoDTO
                    {
                        id_scope_addon = sa.id_scope_addon,
                        id_addon = ad.id_addon,
                        codigo = ad.codigo,
                        nombre = ad.nombre,
                        estado = sa.estado,
                        activo = sa.activo,
                        fecha_desde = sa.fecha_desde,
                        fecha_hasta = sa.fecha_hasta,
                        config_override = sa.config_json_override
                    }
                ).ToListAsync();
            }

            // Para respuesta: mantenemos "addons_evento" pero sin duplicar por id_addon
            var addonsEvento = new List<AddonActivoDTO>();
            addonsEvento.AddRange(addonsEventoSolo);

            foreach (var ac in addonsCuenta)
            {
                // si el mismo addon está contratado también a nivel evento, mostramos el del evento (más específico)
                if (!addonsEventoSolo.Any(x => x.id_addon == ac.id_addon))
                    addonsEvento.Add(ac);
            }

            // 4) Features del plan
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
                    if (!planOverridesByFeature.ContainsKey(pf.id_feature))
                        planOverridesByFeature.Add(pf.id_feature, pf.config_json_override);
                }
            }

            // 5) Features por addons (CUENTA primero, EVENTO después: EVENTO pisa)
            var addonFeatureIds = new HashSet<long>();
            var addonOverridesByFeature = new Dictionary<long, string?>();

            var addonIdsCuenta = addonsCuenta.Select(a => a.id_addon).Distinct().ToList();
            var addonIdsEvento = addonsEventoSolo.Select(a => a.id_addon).Distinct().ToList();

            if (addonIdsCuenta.Count > 0)
            {
                var addonFeaturesCuenta = await _context.ef_addon_features
                    .AsNoTracking()
                    .Where(af => addonIdsCuenta.Contains(af.id_addon) && af.activo == true)
                    .Select(af => new { af.id_addon, af.id_feature, af.config_json_override })
                    .ToListAsync();

                foreach (var af in addonFeaturesCuenta)
                {
                    addonFeatureIds.Add(af.id_feature);
                    addonOverridesByFeature[af.id_feature] = af.config_json_override;
                }
            }

            if (addonIdsEvento.Count > 0)
            {
                var addonFeaturesEvento = await _context.ef_addon_features
                    .AsNoTracking()
                    .Where(af => addonIdsEvento.Contains(af.id_addon) && af.activo == true)
                    .Select(af => new { af.id_addon, af.id_feature, af.config_json_override })
                    .ToListAsync();

                foreach (var af in addonFeaturesEvento)
                {
                    addonFeatureIds.Add(af.id_feature);
                    // EVENTO pisa CUENTA si la misma feature aparece en ambos
                    addonOverridesByFeature[af.id_feature] = af.config_json_override;
                }
            }

            // 6) Overrides de evento
            // IMPORTANTE: traer tanto activas como inactivas
            var eventoOverridesByFeature = new Dictionary<long, string?>();
            var eventoActivosByFeature = new Dictionary<long, bool>();

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

            // 7) Seed base = plan + addons (evento/cuenta) + lo guardado en evento
            var seedIds = new HashSet<long>();
            foreach (var id in planFeatureIds) seedIds.Add(id);
            foreach (var id in addonFeatureIds) seedIds.Add(id);
            foreach (var id in eventoActivosByFeature.Keys) seedIds.Add(id);

            // 8) Expandir dependencias
            var allIds = await ExpandirDependenciasAsync(seedIds);

            // 9) Traer catálogo final
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
                    activo_evento = null,
                    activo_resuelto = false,
                    motivo_inactivo = null
                })
                .ToListAsync();

            // 10) Completar estados / overrides
            foreach (var fe in featuresFinales)
            {
                string? v;

                fe.incluida_en_plan = planFeatureIds.Contains(fe.id_feature);
                fe.incluida_por_addon = addonFeatureIds.Contains(fe.id_feature);

                if (planOverridesByFeature.TryGetValue(fe.id_feature, out v))
                    fe.config_plan_override = v;

                if (addonOverridesByFeature.TryGetValue(fe.id_feature, out v))
                    fe.config_addon_override = v;

                if (eventoOverridesByFeature.TryGetValue(fe.id_feature, out v))
                    fe.config_evento_override = v;

                bool permitidaPorComercial = fe.incluida_en_plan || fe.incluida_por_addon;

                bool? activoEvento = null;
                if (eventoActivosByFeature.ContainsKey(fe.id_feature))
                    activoEvento = eventoActivosByFeature[fe.id_feature];

                fe.activo_evento = activoEvento;

                bool activoResuelto;
                string? motivo = null;

                if (!permitidaPorComercial)
                {
                    activoResuelto = false;
                    motivo = "NO_INCLUIDA";
                }
                else if (activoEvento.HasValue)
                {
                    activoResuelto = activoEvento.Value;
                    if (!activoEvento.Value)
                        motivo = "DESACTIVADA_EN_EVENTO";
                }
                else
                {
                    activoResuelto = true;
                }

                fe.activo_resuelto = activoResuelto;
                fe.motivo_inactivo = motivo;
            }

            // Orden amigable
            featuresFinales = featuresFinales
                .OrderBy(x => x.categoria)
                .ThenBy(x => x.codigo)
                .ToList();

            var resp = new EventoFeaturesEfectivasResponseDTO
            {
                id_evento = idEvento,
                id_plan = idPlan,
                plan_codigo = plan?.codigo,
                plan_nombre = plan?.nombre,
                trial = trialDto,
                addons_evento = addonsEvento,
                features = featuresFinales
            };

            return Ok(resp);
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