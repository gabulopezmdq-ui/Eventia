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
    public class ANT_TipoAntenasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_TipoAntenas> _serviceGenerico;

        public ANT_TipoAntenasController(DataContext context, ILogger<ANT_TipoAntenas> logger, ICRUDService<ANT_TipoAntenas> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_TipoAntenas>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_TipoAntenas>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromForm] ANT_TipoAntenas antena)
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
        public async Task<ActionResult<ANT_TipoAntenas>> Update([FromBody] ANT_TipoAntenas tipoAntena)
        {
            await _serviceGenerico.Update(tipoAntena);
            return Ok(tipoAntena);
        }

    }
}
