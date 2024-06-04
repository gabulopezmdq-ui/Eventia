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
    public class SeguroController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<EV_Seguro> _serviceGenerico;

        public SeguroController(DataContext context, ILogger<EV_Seguro> logger, ICRUDService<EV_Seguro> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<EV_Seguro>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<EV_Seguro>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<EV_Seguro>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Nombre == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] EV_Seguro seguro)
        {
            await _serviceGenerico.Add(seguro);
            return Ok(seguro);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<EV_Seguro>> Update([FromBody] EV_Seguro seguro)
        {
            await _serviceGenerico.Update(seguro);
            return Ok(seguro);
        }

    }
}
