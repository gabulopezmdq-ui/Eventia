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
            mercado = (mercado ?? "AR").Trim().ToUpperInvariant();
            moneda = (moneda ?? "ARS").Trim().ToUpperInvariant();
            tipo = (tipo ?? "B2C").Trim().ToUpperInvariant();

            var now = DateTimeOffset.UtcNow;

            // 1) Planes
            var planes = await _context.ef_planes.AsNoTracking()
                .Where(p => p.activo == true && p.tipo == tipo)
                .Select(p => new { p.id_plan, p.codigo, p.nombre, p.descripcion, p.tipo, p.periodo })
                .OrderBy(p => p.codigo)
                .ToListAsync();

            var planIds = planes.Select(p => p.id_plan).ToList();

            // 2) Precios vigentes
            var precios = await _context.ef_precios.AsNoTracking()
                .Where(pr => pr.objeto_tipo == "PLAN"
                             && pr.id_plan != null
                             && planIds.Contains(pr.id_plan.Value)
                             && pr.activo == true
                             && pr.codigo_mercado == mercado
                             && pr.codigo_moneda == moneda
                             && pr.vigente_desde <= now
                             && (pr.vigente_hasta == null || pr.vigente_hasta > now))
                .OrderByDescending(pr => pr.vigente_desde)
                .ToListAsync();

            var precioPorPlan = precios
                .GroupBy(x => x.id_plan!.Value)
                .ToDictionary(g => g.Key, g => g.First());

            // 3) Features por plan
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

            // 4) Límites con traducción
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
                .Select(t => new TraduccionTempDTO
                {
                    id_item = t.id_item,
                    id_idioma = t.id_idioma,
                    texto = t.texto
                })
                .ToListAsync();

            var tradDesc = await _context.Set<ef_param_traducciones>().AsNoTracking()
                .Where(t => t.activo == true
                            && t.entidad == ENT_LIM_DESC
                            && limiteIds.Contains(t.id_item)
                            && (t.id_idioma == idIdioma || t.id_idioma == IDIOMA_ES_AR))
                .Select(t => new TraduccionTempDTO
                {
                    id_item = t.id_item,
                    id_idioma = t.id_idioma,
                    texto = t.texto
                })
                .ToListAsync();

            string GetTexto(List<TraduccionTempDTO> list, long idItem, short idioma)
            {
                var t1 = list.FirstOrDefault(x => x.id_item == idItem && x.id_idioma == idioma);
                if (t1 != null) return t1.texto;

                var t2 = list.FirstOrDefault(x => x.id_item == idItem && x.id_idioma == IDIOMA_ES_AR);
                if (t2 != null) return t2.texto;

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
                    decimal importePublicado = ObtenerPrecioPublicado(pr, now);

                    dto.precio = new PlanPublicoPrecioDTO
                    {
                        mercado = pr.codigo_mercado,
                        moneda = pr.codigo_moneda,
                        importe = importePublicado,
                        impuestos_incluidos = pr.impuestos_incluidos,
                        vigente_desde = pr.vigente_desde
                    };
                }

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

                var limPlan = limitesRaw
                    .Where(x => x.id_plan == p.id_plan)
                    .Select(x => new PlanPublicoLimiteDTO
                    {
                        codigo_limite = x.codigo_limite,
                        orden = x.orden,
                        nombre = GetTexto(tradNom, (long)x.id_limite, idIdioma),
                        descripcion = GetTexto(tradDesc, (long)x.id_limite, idIdioma),
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

        private static decimal ObtenerPrecioPublicado(ef_precios precio, DateTimeOffset now)
        {
            bool tieneLanzamiento =
                precio.precio_lanzamiento.HasValue
                && (!precio.lanzamiento_desde.HasValue || precio.lanzamiento_desde.Value <= now)
                && (!precio.lanzamiento_hasta.HasValue || precio.lanzamiento_hasta.Value >= now);

            return tieneLanzamiento
                ? precio.precio_lanzamiento.Value
                : precio.precio_lista;
        }

        private class TraduccionTempDTO
        {
            public long id_item { get; set; }
            public short id_idioma { get; set; }
            public string texto { get; set; }
        }
    }
}