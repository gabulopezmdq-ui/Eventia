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
    public class planesPublicController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<planesPublicController> _logger;

        private const short IDIOMA_ES_AR = 1;
        private const string ENT_LIM_NOMBRE = "LIMITE_PLAN_NOMBRE";
        private const string ENT_LIM_DESC = "LIMITE_PLAN_DESC";

        public planesPublicController(DataContext context, ILogger<planesPublicController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=B2C&idIdioma=1
        [HttpGet("PublicCatalog")]
        public async Task<ActionResult<List<PlanPublicoDTO>>> PublicCatalog(
            [FromQuery] string mercado = "AR",
            [FromQuery] string moneda = "ARS",
            [FromQuery] string tipo = "B2C",
            [FromQuery] short idIdioma = IDIOMA_ES_AR)
        {
            // 1) Planes
            var planes = await _context.ef_planes.AsNoTracking()
                .Where(p => p.activo == true && p.tipo == tipo)
                .Select(p => new { p.id_plan, p.codigo, p.nombre, p.descripcion, p.tipo, p.periodo })
                .OrderBy(p => p.codigo)
                .ToListAsync();

            var planIds = planes.Select(p => p.id_plan).ToList();

            // 2) Precios
            var precios = await _context.ef_precios.AsNoTracking()
                .Where(pr => pr.objeto_tipo == "PLAN"
                             && pr.id_plan != null
                             && planIds.Contains(pr.id_plan.Value)
                             && pr.activo == true
                             && pr.mercado == mercado
                             && pr.moneda == moneda
                             && pr.vigente_desde <= DateTimeOffset.UtcNow
                             && (pr.vigente_hasta == null || pr.vigente_hasta > DateTimeOffset.UtcNow))
                .OrderByDescending(pr => pr.vigente_desde)
                .ToListAsync();

            var precioPorPlan = precios
                .GroupBy(x => x.id_plan!.Value)
                .ToDictionary(g => g.Key, g => g.First());

            // 3) Features por plan (igual que ya tenías)
            var planFeatures = await _context.ef_plan_features.AsNoTracking()
                .Where(pf => planIds.Contains(pf.id_plan) && pf.activo == true)
                .Select(pf => new { pf.id_plan, pf.id_feature })
                .ToListAsync();

            var featureIds = planFeatures.Select(x => x.id_feature).Distinct().ToList();

            var features = await _context.ef_param_features.AsNoTracking()
                .Where(f => featureIds.Contains(f.id_feature) && f.activo == true)
                .Select(f => new { f.id_feature, f.codigo, f.nombre, f.descripcion, f.categoria, f.monetizable })
                .ToListAsync();

            var featureById = features.ToDictionary(x => x.id_feature, x => x);

            // 4) Límites con traducción (NOMBRE + DESC)
            //    Solo muestra los que están en ef_param_limites.activo=true y mostrar_publico=true
            var limitesRaw = await (
                from l in _context.ef_plan_limites.AsNoTracking()
                join plim in _context.Set<ef_param_limites>().AsNoTracking()
                    on l.codigo_limite equals plim.codigo_limite
                where planIds.Contains(l.id_plan)
                      && l.activo == true
                      && plim.activo == true
                      && plim.mostrar_publico == true
                select new
                {
                    l.id_plan,
                    l.codigo_limite,
                    l.valor_int,
                    l.valor_numeric,
                    l.valor_json,
                    plim.id_limite,
                    plim.orden
                }
            ).ToListAsync();

            var limiteIds = limitesRaw.Select(x => (long)x.id_limite).Distinct().ToList();

            var tradNom = await _context.Set<ef_param_traducciones>().AsNoTracking()
                .Where(t => t.activo == true
                            && t.entidad == ENT_LIM_NOMBRE
                            && limiteIds.Contains(t.id_item)
                            && (t.id_idioma == idIdioma || t.id_idioma == IDIOMA_ES_AR))
                .Select(t => new { t.id_item, t.id_idioma, t.texto })
                .ToListAsync();

            var tradDesc = await _context.Set<ef_param_traducciones>().AsNoTracking()
                .Where(t => t.activo == true
                            && t.entidad == ENT_LIM_DESC
                            && limiteIds.Contains(t.id_item)
                            && (t.id_idioma == idIdioma || t.id_idioma == IDIOMA_ES_AR))
                .Select(t => new { t.id_item, t.id_idioma, t.texto })
                .ToListAsync();

            // Diccionarios con fallback: primero idioma pedido, si no es-AR
            string? GetTexto(List<dynamic> list, long idItem, short idioma)
            {
                var t1 = list.FirstOrDefault(x => (long)x.id_item == idItem && (short)x.id_idioma == idioma);
                if (t1 != null) return (string)t1.texto;

                var t2 = list.FirstOrDefault(x => (long)x.id_item == idItem && (short)x.id_idioma == IDIOMA_ES_AR);
                if (t2 != null) return (string)t2.texto;

                return null;
            }

            var resp = new List<PlanPublicoDTO>();

            foreach (var p in planes)
            {
                var dto = new PlanPublicoDTO
                {
                    codigo = p.codigo,
                    nombre = p.nombre,
                    descripcion = p.descripcion,
                    tipo = p.tipo,
                    periodo = p.periodo
                };

                if (precioPorPlan.TryGetValue(p.id_plan, out var pr))
                {
                    dto.precio = new PlanPublicoPrecioDTO
                    {
                        mercado = pr.mercado,
                        moneda = pr.moneda,
                        importe = pr.importe,
                        impuestos_incluidos = pr.impuestos_incluidos,
                        vigente_desde = pr.vigente_desde
                    };
                }

                // features
                var idsFeaturesPlan = planFeatures
                    .Where(x => x.id_plan == p.id_plan)
                    .Select(x => x.id_feature)
                    .Distinct()
                    .ToList();

                foreach (var idF in idsFeaturesPlan)
                {
                    if (!featureById.TryGetValue(idF, out var f))
                        continue;

                    dto.features.Add(new PlanPublicoFeatureDTO
                    {
                        codigo = f.codigo,
                        nombre = f.nombre,
                        categoria = f.categoria,
                        descripcion = f.descripcion,
                        monetizable = f.monetizable
                    });
                }

                dto.features = dto.features
                    .OrderBy(x => x.categoria)
                    .ThenBy(x => x.nombre)
                    .ToList();

                // límites (traducidos)
                var limPlan = limitesRaw
                    .Where(x => x.id_plan == p.id_plan)
                    .Select(x => new PlanPublicoLimiteDTO
                    {
                        codigo_limite = x.codigo_limite,
                        orden = x.orden,
                        nombre = GetTexto(tradNom.Cast<dynamic>().ToList(), (long)x.id_limite, idIdioma),
                        descripcion = GetTexto(tradDesc.Cast<dynamic>().ToList(), (long)x.id_limite, idIdioma),
                        valor_int = x.valor_int,
                        valor_numeric = x.valor_numeric,
                        valor_json = x.valor_json
                    })
                    .OrderBy(x => x.orden ?? 0)
                    .ThenBy(x => x.nombre)
                    .ToList();

                dto.limites = limPlan;

                resp.Add(dto);
            }

            return Ok(resp.OrderBy(x => x.codigo).ToList());
        }
    }
}