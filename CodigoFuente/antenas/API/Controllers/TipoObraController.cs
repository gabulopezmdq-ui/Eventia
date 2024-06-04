using  rsAPIElevador.DataSchema;
using  rsAPIElevador.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsAPIElevador.Controllers
{
    [ApiController]
    //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class TipoObraController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<EV_TipoObra> _serviceGenerico;

        public TipoObraController(DataContext context, ILogger<EV_TipoObra> logger, ICRUDService<EV_TipoObra> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<EV_TipoObra>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<EV_TipoObra>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<EV_TipoObra>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] EV_TipoObra tipoObra)
        {
            await _serviceGenerico.Add(tipoObra);
            return Ok(tipoObra);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<EV_TipoObra>> Update([FromBody] EV_TipoObra tipoObra)
        {
            await _serviceGenerico.Update(tipoObra);
            return Ok(tipoObra);
        }

    }
}
