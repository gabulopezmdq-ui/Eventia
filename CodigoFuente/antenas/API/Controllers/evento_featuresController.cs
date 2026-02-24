using API.DataSchema;
using API.Services;
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
    [AllowAnonymous]
    [Route("[controller]")]
    public class evento_featuresController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_evento_features> _serviceGenerico;
        private readonly ILogger<evento_featuresController> _logger;

        public evento_featuresController(DataContext context, ILogger<evento_featuresController> logger, ICRUDService<ef_evento_features> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public ActionResult<IEnumerable<ef_evento_features>> GetAll()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_evento_features>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_evento_features item)
        {
            // Validación de dependencias SOLO si se activa
            if (item.activo)
            {
                var valid = await ValidarDependencias(item.id_evento, item.id_feature);
                if (!valid.ok)
                    return BadRequest(new { error = "Dependencias incompletas.", dependencias_faltantes = valid.faltantes });
            }

            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_evento_features>> Update([FromBody] ef_evento_features item)
        {
            // Validación de dependencias SOLO si se activa
            if (item.activo)
            {
                var valid = await ValidarDependencias(item.id_evento, item.id_feature);
                if (!valid.ok)
                    return BadRequest(new { error = "Dependencias incompletas.", dependencias_faltantes = valid.faltantes });
            }

            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        // ==========================================================
        // VALIDACIÓN DE DEPENDENCIAS
        // ==========================================================
        private async Task<(bool ok, List<object> faltantes)> ValidarDependencias(long id_evento, long id_feature)
        {
            // 1) Traer ids requeridos por la feature
            var requeridas = await _context.Set<ef_param_feature_dependencias>()
                .Where(d => d.id_feature == id_feature)
                .Select(d => d.id_feature_requiere)
                .ToListAsync();

            if (requeridas == null || requeridas.Count == 0)
                return (true, new List<object>());

            // 2) Buscar cuáles de esas requeridas están activas en el evento
            var activas = await _context.Set<ef_evento_features>()
                .Where(ef => ef.id_evento == id_evento && ef.activo)
                .Select(ef => ef.id_feature)
                .ToListAsync();

            var faltanIds = requeridas.Except(activas).ToList();

            if (faltanIds.Count == 0)
                return (true, new List<object>());

            // 3) Para devolver un error más lindo, traer códigos de las que faltan
            var faltantes = await _context.Set<ef_param_features>()
                .Where(f => faltanIds.Contains(f.id_feature))
                .Select(f => new { id_feature = f.id_feature, codigo = f.codigo, nombre = f.nombre })
                .Cast<object>()
                .ToListAsync();

            return (false, faltantes);
        }
    }
}

