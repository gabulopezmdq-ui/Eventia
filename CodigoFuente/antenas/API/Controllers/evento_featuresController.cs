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

            if (activo)
            {
                var valid = await ValidarDependencias(idEvento, idFeature);
                if (!valid.ok)
                    return BadRequest(new { error = "Dependencias incompletas.", dependencias_faltantes = valid.faltantes });
            }

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

            await SincronizarRegalosPadreAsync(idEvento);

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
                if (it.activo)
                {
                    var valid = await ValidarDependencias(idEvento, it.id_feature);
                    if (!valid.ok)
                    {
                        return BadRequest(new
                        {
                            error = "Dependencias incompletas.",
                            id_feature = it.id_feature,
                            dependencias_faltantes = valid.faltantes
                        });
                    }
                }
            }

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
            }

            await SincronizarRegalosPadreAsync(idEvento);

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

            await SincronizarRegalosPadreAsync(idEvento);

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

        private async Task SincronizarRegalosPadreAsync(long idEvento)
        {
            var featuresRegalos = await _context.Set<ef_param_features>()
                .Where(f => f.codigo == "REGALOS"
                         || f.codigo == "REGALOS_TRANSFERENCIAS"
                         || f.codigo == "REGALOS_LISTA"
                         || f.codigo == "REGALOS_FONDO_METAS")
                .Select(f => new { f.id_feature, f.codigo })
                .ToListAsync();

            var featurePadre = featuresRegalos.FirstOrDefault(f => f.codigo == "REGALOS");

            if (featurePadre == null)
                return;

            var idsSubfeatures = featuresRegalos
                .Where(f => f.codigo != "REGALOS")
                .Select(f => f.id_feature)
                .ToList();

            bool haySubfeatureActiva = await _context.Set<ef_evento_features>()
                .AnyAsync(x =>
                    x.id_evento == idEvento &&
                    idsSubfeatures.Contains(x.id_feature) &&
                    x.activo == true);

            var rowPadre = await _context.Set<ef_evento_features>()
                .SingleOrDefaultAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_feature == featurePadre.id_feature);

            if (haySubfeatureActiva)
            {
                if (rowPadre == null)
                {
                    _context.Set<ef_evento_features>().Add(new ef_evento_features
                    {
                        id_evento = idEvento,
                        id_feature = featurePadre.id_feature,
                        activo = true,
                        config_json = null
                    });
                }
                else
                {
                    rowPadre.activo = true;
                }
            }
            else
            {
                if (rowPadre != null)
                    rowPadre.activo = false;
            }
        }

        private async Task<(bool ok, List<object> faltantes)> ValidarDependencias(long id_evento, long id_feature)
        {
            var requeridas = await _context.Set<ef_param_feature_dependencias>()
                .Where(d => d.id_feature == id_feature)
                .Select(d => d.id_feature_requiere)
                .ToListAsync();

            if (requeridas == null || requeridas.Count == 0)
                return (true, new List<object>());

            var activas = await _context.Set<ef_evento_features>()
                .Where(ef => ef.id_evento == id_evento && ef.activo == true)
                .Select(ef => ef.id_feature)
                .ToListAsync();

            var faltanIds = requeridas.Except(activas).ToList();

            if (faltanIds.Count == 0)
                return (true, new List<object>());

            var faltantes = await _context.Set<ef_param_features>()
                .Where(f => faltanIds.Contains(f.id_feature))
                .Select(f => new { id_feature = f.id_feature, codigo = f.codigo, nombre = f.nombre })
                .Cast<object>()
                .ToListAsync();

            return (false, faltantes);
        }
    }
}