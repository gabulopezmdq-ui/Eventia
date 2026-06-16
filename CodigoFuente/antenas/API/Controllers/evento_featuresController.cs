using API.DataSchema;
using API.Security;
using API.Services.Eventos.Features;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class evento_featuresController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_featuresController> _logger;
        private readonly IEventoFeaturePostProcesoService _postProcesoFeatures;

        public evento_featuresController(
            DataContext context,
            ILogger<evento_featuresController> logger,
            IEventoFeaturePostProcesoService postProcesoFeatures)
        {
            _context = context;
            _logger = logger;
            _postProcesoFeatures = postProcesoFeatures;
        }

        [HttpGet("GetByEvento")]
        public async Task<ActionResult<IEnumerable<ef_evento_features>>> GetByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var list = await _context.Set<ef_evento_features>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .OrderBy(x => x.id_feature)
                .ToListAsync();

            return Ok(list);
        }

        [HttpPut("SetActivo")]
        public async Task<IActionResult> SetActivo(
            [FromQuery] long idEvento,
            [FromQuery] long idFeature,
            [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            bool featureExiste = await _context.Set<ef_param_features>()
                .AnyAsync(f => f.id_feature == idFeature && f.activo == true);

            if (!featureExiste)
                return BadRequest("Feature inexistente o inactiva.");

            var row = await _context.Set<ef_evento_features>()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento && x.id_feature == idFeature);

            if (row == null)
            {
                row = new ef_evento_features
                {
                    id_evento = idEvento,
                    id_feature = idFeature,
                    activo = activo,
                    config_json = null
                };

                _context.Set<ef_evento_features>().Add(row);
            }
            else
            {
                row.activo = activo;
            }

            await SincronizarHijasFeatureAsync(idEvento, idFeature, activo);

            await _context.SaveChangesAsync();

            await _postProcesoFeatures.SincronizarAsync(idEvento);

            return Ok(new
            {
                ok = true,
                id_evento = idEvento,
                id_feature = idFeature,
                activo = row.activo
            });
        }

        public class SetActivosBulkRequest
        {
            public List<SetActivoItem> items { get; set; } = new List<SetActivoItem>();
        }

        public class SetActivoItem
        {
            public long id_feature { get; set; }
            public bool activo { get; set; }
        }

        [HttpPut("SetActivosBulk")]
        public async Task<IActionResult> SetActivosBulk(
            [FromQuery] long idEvento,
            [FromBody] SetActivosBulkRequest req)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            if (req == null || req.items == null || req.items.Count == 0)
                return BadRequest("items vacío.");

            var ids = req.items.Select(i => i.id_feature).Distinct().ToList();

            var existentes = await _context.Set<ef_param_features>()
                .Where(f => ids.Contains(f.id_feature) && f.activo == true)
                .Select(f => f.id_feature)
                .ToListAsync();

            var faltan = ids.Except(existentes).ToList();

            if (faltan.Count > 0)
                return BadRequest(new { error = "Hay features inexistentes/inactivas.", ids = faltan });

            var rows = await _context.Set<ef_evento_features>()
                .Where(x => x.id_evento == idEvento && ids.Contains(x.id_feature))
                .ToListAsync();

            var byFeature = rows.ToDictionary(x => x.id_feature, x => x);

            foreach (var it in req.items)
            {
                if (byFeature.TryGetValue(it.id_feature, out var row))
                {
                    row.activo = it.activo;
                }
                else
                {
                    _context.Set<ef_evento_features>().Add(new ef_evento_features
                    {
                        id_evento = idEvento,
                        id_feature = it.id_feature,
                        activo = it.activo,
                        config_json = null
                    });
                }

                await SincronizarHijasFeatureAsync(idEvento, it.id_feature, it.activo);
            }

            await _context.SaveChangesAsync();

            await _postProcesoFeatures.SincronizarAsync(idEvento);

            return Ok(new { ok = true, id_evento = idEvento, updated = req.items.Count });
        }

        public class SetConfigRequest
        {
            public string? config_json { get; set; }
        }

        [HttpPut("SetConfig")]
        public async Task<IActionResult> SetConfig(
            [FromQuery] long idEvento,
            [FromQuery] long idFeature,
            [FromBody] SetConfigRequest req)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var row = await _context.Set<ef_evento_features>()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento && x.id_feature == idFeature);

            if (row == null)
            {
                row = new ef_evento_features
                {
                    id_evento = idEvento,
                    id_feature = idFeature,
                    activo = true,
                    config_json = req.config_json
                };

                _context.Set<ef_evento_features>().Add(row);
            }
            else
            {
                row.config_json = req.config_json;
            }

            await SincronizarHijasFeatureAsync(idEvento, idFeature, true);

            await _context.SaveChangesAsync();

            await _postProcesoFeatures.SincronizarAsync(idEvento);

            return Ok(new
            {
                ok = true,
                id_evento = idEvento,
                id_feature = idFeature,
                config_json = row.config_json
            });
        }

        private async Task SincronizarHijasFeatureAsync(long idEvento, long idFeaturePadre, bool activo)
        {
            var hijasIds = await _context.Set<ef_param_features>()
                .Where(f => f.id_feature_padre == idFeaturePadre && f.activo == true)
                .Select(f => f.id_feature)
                .ToListAsync();

            if (hijasIds.Count == 0)
                return;

            var existentes = await _context.Set<ef_evento_features>()
                .Where(x => x.id_evento == idEvento && hijasIds.Contains(x.id_feature))
                .ToListAsync();

            var existentesByFeature = existentes.ToDictionary(x => x.id_feature, x => x);

            foreach (var idHija in hijasIds)
            {
                if (existentesByFeature.TryGetValue(idHija, out var row))
                {
                    row.activo = activo;
                }
                else
                {
                    _context.Set<ef_evento_features>().Add(new ef_evento_features
                    {
                        id_evento = idEvento,
                        id_feature = idHija,
                        activo = activo,
                        config_json = null
                    });
                }
            }
        }
    }
}