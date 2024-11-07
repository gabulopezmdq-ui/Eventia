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
    [Authorize(Roles = "SuperAdmin, Admin")]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class TiposLiquidacionesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_TiposLiquidaciones> _serviceGenerico;

        public TiposLiquidacionesController(DataContext context, ILogger<MEC_TiposLiquidaciones> logger, ICRUDService<MEC_TiposLiquidaciones> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_TiposLiquidaciones>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_CarRevista>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_TiposLiquidaciones>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<MEC_TiposLiquidaciones>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_TiposLiquidaciones tiposLiq)
        {
            await _serviceGenerico.Add(tiposLiq);
            return Ok(tiposLiq);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_TiposLiquidaciones>> Update([FromBody] MEC_TiposLiquidaciones tiposLiq)
        {
            await _serviceGenerico.Update(tiposLiq);
            return Ok(tiposLiq);
        }


    }
}
