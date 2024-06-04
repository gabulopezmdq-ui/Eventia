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
    public class TipoEquipamientoController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<EV_TipoEquipamiento> _serviceGenerico;

        public TipoEquipamientoController(DataContext context, ILogger<EV_TipoEquipamiento> logger, ICRUDService<EV_TipoEquipamiento> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<EV_TipoEquipamiento>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<EV_TipoEquipamiento>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<EV_TipoEquipamiento>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody]EV_TipoEquipamiento tipoEquipamiento)
        {
            await _serviceGenerico.Add(tipoEquipamiento);
            return Ok(tipoEquipamiento);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<EV_TipoEquipamiento>> Update([FromBody] EV_TipoEquipamiento tipoEquipamiento)
        {
            await _serviceGenerico.Update(tipoEquipamiento);
            return Ok(tipoEquipamiento);
        }

    }
}
