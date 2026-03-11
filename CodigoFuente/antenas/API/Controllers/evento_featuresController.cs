using API.DataSchema;
using API.Security;
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
    [Authorize] // ✅ importante: no lo dejes AllowAnonymous
    [Route("[controller]")]
    public class evento_featuresController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_featuresController> _logger;

        public evento_featuresController(DataContext context, ILogger<evento_featuresController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ==========================================================
        // GET /evento_features/GetByEvento?idEvento=16
        // Devuelve overrides guardados en ef_evento_features
        // ==========================================================
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

        // ==========================================================
        // PUT /evento_features/SetActivo?idEvento=16&idFeature=18&activo=false
        // Upsert por (id_evento,id_feature). Guarda en ef_evento_features.
        // ==========================================================
        [HttpPut("SetActivo")]
        public async Task<IActionResult> SetActivo([FromQuery] long idEvento, [FromQuery] long idFeature, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();

            // Seguridad: debe pertenecer al evento
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            // Validar feature existe y activa
            bool featureExiste = await _context.Set<ef_param_features>()
                .AnyAsync(f => f.id_feature == idFeature && f.activo == true);

            if (!featureExiste)
                return BadRequest("Feature inexistente o inactiva.");

            // Validación de dependencias SOLO si se activa
            if (activo)
            {
                var valid = await ValidarDependencias(idEvento, idFeature);
                if (!valid.ok)
                    return BadRequest(new { error = "Dependencias incompletas.", dependencias_faltantes = valid.faltantes });
            }

            // Upsert por unique (id_evento,id_feature)
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

            await _context.SaveChangesAsync();

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
        public async Task<IActionResult> SetActivosBulk([FromQuery] long idEvento, [FromBody] SetActivosBulkRequest req)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            if (req == null || req.items == null || req.items.Count == 0)
                return BadRequest("items vacío.");

            // Traer existentes del evento para upsert rápido
            var ids = req.items.Select(i => i.id_feature).Distinct().ToList();

            // Validar que las features existan
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

            // Validar dependencias solo para las que se activan
            foreach (var it in req.items)
            {
                if (it.activo)
                {
                    var valid = await ValidarDependencias(idEvento, it.id_feature);
                    if (!valid.ok)
                        return BadRequest(new { error = "Dependencias incompletas.", id_feature = it.id_feature, dependencias_faltantes = valid.faltantes });
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

            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_evento = idEvento, updated = req.items.Count });
        }

        // ==========================================================
        // PUT /evento_features/SetConfig?idEvento=16&idFeature=18
        // Body: { "config_json": "{...}" }
        // Solo si querés setear config por evento (opcional).
        // ==========================================================
        public class SetConfigRequest
        {
            public string? config_json { get; set; }
        }

        [HttpPut("SetConfig")]
        public async Task<IActionResult> SetConfig([FromQuery] long idEvento, [FromQuery] long idFeature, [FromBody] SetConfigRequest req)
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
                // Si no existía override, lo creamos activo=true por default (podés cambiarlo)
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

            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_evento = idEvento, id_feature = idFeature, config_json = row.config_json });
        }

        // ==========================================================
        // VALIDACIÓN DE DEPENDENCIAS
        // ==========================================================
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