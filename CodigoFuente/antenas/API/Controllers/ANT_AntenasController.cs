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
    //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class ANT_AntenasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_Antenas> _serviceGenerico;

        public ANT_AntenasController(DataContext context, ILogger<ANT_Antenas> logger, ICRUDService<ANT_Antenas> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_Antenas>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_Antenas>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByExpediente")]
        public async Task<ActionResult<ANT_Antenas>> Get(int? Expediente)
        {
            return Ok(await _serviceGenerico.GetByParam(a => a.IdExpediente == Expediente));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ANT_Antenas antena)
        {
            await _serviceGenerico.Add(antena);
            return Ok(antena);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ANT_Antenas>> Update([FromBody] ANT_Antenas antena)
        {
            await _serviceGenerico.Update(antena);
            return Ok(antena);
        }

    }
}
