using  API.DataSchema;
using  API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
   // [AllowAnonymous]
    [Route("[controller]")]
    public class plantillas_eventoController : ControllerBase
    {
        private readonly ICRUDService<ef_plantillas_evento> _serviceGenerico;
        private readonly ILogger<plantillas_eventoController> _logger;

        public plantillas_eventoController(ILogger<plantillas_eventoController> logger, ICRUDService<ef_plantillas_evento> serviceGenerico)
        {
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_plantillas_evento>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_plantillas_evento>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        [HttpGet("GetByCodigo")]
        public async Task<ActionResult<ef_plantillas_evento>> Get(string codigo)
        {
            return Ok(await _serviceGenerico.GetByParam(x => x.codigo == codigo));
        }

        [HttpGet("GetByTipo")]
        public async Task<ActionResult<IEnumerable<ef_plantillas_evento>>> GetByTipo([FromQuery] short idTipoEvento, [FromQuery] string activo = null)
        {
            // Si no mandás activo, devuelve todas las plantillas del tipo
            // Si mandás activo ("true"/"false"), filtra también por activo
            var list = await _serviceGenerico.GetListByParam(p =>
                p.id_tipo_evento == idTipoEvento &&
                (activo == null || p.activo == (activo.ToLower() == "true" || activo == "1" || activo.ToLower() == "t"))
            );

            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_plantillas_evento item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_plantillas_evento>> Update([FromBody] ef_plantillas_evento item)
        {
            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }
    }
}
