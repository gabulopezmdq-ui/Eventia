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
    public class RepTecnicoController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<EV_RepTecnico> _serviceGenerico;

        public RepTecnicoController(DataContext context, ILogger<EV_RepTecnico> logger, ICRUDService<EV_RepTecnico> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<EV_RepTecnico>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<EV_RepTecnico>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<EV_RepTecnico>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Apellido == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] EV_RepTecnico repTecnico)
        {
            await _serviceGenerico.Add(repTecnico);
            return Ok(repTecnico);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<EV_RepTecnico>> Update([FromBody] EV_RepTecnico repTecnico)
        {
            await _serviceGenerico.Update(repTecnico);
            return Ok(repTecnico);
        }

    }
}
