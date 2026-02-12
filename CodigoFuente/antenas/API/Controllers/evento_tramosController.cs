using API.DataSchema;
using API.Services;
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
    [AllowAnonymous]
    [Route("[controller]")]
    public class evento_tramosController : ControllerBase
    {
        private readonly ICRUDService<ef_evento_tramos> _serviceGenerico;
        private readonly ILogger<evento_tramosController> _logger;

        public evento_tramosController(ILogger<evento_tramosController> logger, ICRUDService<ef_evento_tramos> serviceGenerico)
        {
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_evento_tramos>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_evento_tramos>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_evento_tramos item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_evento_tramos>> Update([FromBody] ef_evento_tramos item)
        {
            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        //[HttpDelete]
        //public async Task<IActionResult> Delete(long Id)
        //{
        //    await _serviceGenerico.DeleteLong(Id);
        //    return Ok();
        //}
    }
}
