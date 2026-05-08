using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class addonsPublicController : ControllerBase
    {
        private readonly DataContext _context;

        public addonsPublicController(DataContext context)
        {
            _context = context;
        }

        // GET /addonsPublic/PublicCatalog?mercado=AR&moneda=ARS&scope=EVENTO
        [HttpGet("PublicCatalog")]
        public async Task<ActionResult<List<AddonPublicoDTO>>> PublicCatalog(
            [FromQuery] string mercado = "AR",
            [FromQuery] string moneda = "ARS",
            [FromQuery] string scope = "EVENTO")
        {
            mercado = (mercado ?? "AR").Trim().ToUpperInvariant();
            moneda = (moneda ?? "ARS").Trim().ToUpperInvariant();
            scope = (scope ?? "EVENTO").Trim().ToUpperInvariant();

            var now = DateTimeOffset.UtcNow;

            var addons = await _context.Set<ef_addons>().AsNoTracking()
                .Where(a => a.activo == true && a.scope == scope)
                .Select(a => new { a.id_addon, a.codigo, a.nombre, a.descripcion, a.scope })
                .OrderBy(a => a.codigo)
                .ToListAsync();

            var ids = addons.Select(x => x.id_addon).ToList();

            // precios vigentes por addon
            var precios = await _context.Set<ef_precios>().AsNoTracking()
                .Where(p => p.activo == true
                            && p.objeto_tipo == "ADDON"
                            && p.id_addon != null
                            && ids.Contains(p.id_addon.Value)
                            && p.mercado == mercado
                            && p.moneda == moneda
                            && p.vigente_desde <= now
                            && (p.vigente_hasta == null || p.vigente_hasta > now))
                .OrderByDescending(p => p.vigente_desde)
                .ToListAsync();

            var precioPorAddon = precios
                .GroupBy(x => x.id_addon!.Value)
                .ToDictionary(g => g.Key, g => g.First());

            // addon -> features
            var addonFeatures = await _context.Set<ef_addon_features>().AsNoTracking()
                .Where(af => af.activo == true && ids.Contains(af.id_addon))
                .Select(af => new { af.id_addon, af.id_feature })
                .ToListAsync();

            var featureIds = addonFeatures.Select(x => x.id_feature).Distinct().ToList();

            var features = await _context.Set<ef_param_features>().AsNoTracking()
                .Where(f => f.activo == true && featureIds.Contains(f.id_feature))
                .Select(f => new { f.id_feature, f.codigo, f.nombre, f.categoria, f.monetizable })
                .ToListAsync();

            var featById = features.ToDictionary(x => x.id_feature, x => x);

            var resp = new List<AddonPublicoDTO>();

            foreach (var a in addons)
            {
                var dto = new AddonPublicoDTO
                {
                    id_addon = a.id_addon,
                    codigo = a.codigo,
                    nombre = a.nombre,
                    descripcion = a.descripcion,
                    scope = a.scope
                };

                if (precioPorAddon.TryGetValue(a.id_addon, out var pr))
                {
                    dto.precio = new AddonPublicoPrecioDTO
                    {
                        mercado = pr.mercado,
                        moneda = pr.moneda,
                        importe = pr.importe,
                        impuestos_incluidos = pr.impuestos_incluidos,
                        vigente_desde = pr.vigente_desde
                    };
                }

                var idsFeat = addonFeatures.Where(x => x.id_addon == a.id_addon).Select(x => x.id_feature).Distinct().ToList();
                foreach (var idF in idsFeat)
                {
                    if (!featById.TryGetValue(idF, out var f)) continue;

                    dto.features.Add(new AddonPublicoFeatureDTO
                    {
                        id_feature = f.id_feature,
                        codigo = f.codigo,
                        nombre = f.nombre,
                        categoria = f.categoria,
                        monetizable = f.monetizable
                    });
                }

                dto.features = dto.features.OrderBy(x => x.categoria).ThenBy(x => x.nombre).ToList();

                resp.Add(dto);
            }

            return Ok(resp.OrderBy(x => x.codigo).ToList());
        }
    }
}
