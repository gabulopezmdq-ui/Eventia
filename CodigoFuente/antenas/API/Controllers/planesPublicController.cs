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

        public planesPublicController(DataContext context, ILogger<planesPublicController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=B2C
        [HttpGet("PublicCatalog")]
        public async Task<ActionResult<List<PlanPublicoDTO>>> PublicCatalog(
            [FromQuery] string mercado = "AR",
            [FromQuery] string moneda = "ARS",
            [FromQuery] string tipo = "B2C")
        {
            var planes = await _context.ef_planes.AsNoTracking()
                .Where(p => p.activo == true && p.tipo == tipo)
                .Select(p => new { p.id_plan, p.codigo, p.nombre, p.descripcion, p.tipo, p.periodo })
                .OrderBy(p => p.codigo)
                .ToListAsync();

            var planIds = planes.Select(p => p.id_plan).ToList();

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

            var limites = await _context.ef_plan_limites.AsNoTracking()
                .Where(l => planIds.Contains(l.id_plan) && l.activo == true)
                .Select(l => new { l.id_plan, l.codigo_limite, l.valor_int, l.valor_numeric, l.valor_json })
                .ToListAsync();

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

                dto.features = dto.features.OrderBy(x => x.categoria).ThenBy(x => x.nombre).ToList();

                dto.limites = limites
                    .Where(x => x.id_plan == p.id_plan)
                    .OrderBy(x => x.codigo_limite)
                    .Select(x => new PlanPublicoLimiteDTO
                    {
                        codigo_limite = x.codigo_limite,
                        valor_int = x.valor_int,
                        valor_numeric = x.valor_numeric,
                        valor_json = x.valor_json
                    })
                    .ToList();

                resp.Add(dto);
            }

            return Ok(resp.OrderBy(x => x.codigo).ToList());
        }
    }
}
