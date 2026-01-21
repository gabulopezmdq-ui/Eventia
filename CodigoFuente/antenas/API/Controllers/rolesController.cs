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
    public class RolesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_roles> _serviceGenerico;
        private readonly ILogger<RolesController> _logger;

        public RolesController(DataContext context, ILogger<RolesController> logger, ICRUDService<ef_roles> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("ping")]
        public IActionResult Ping() => Ok("pong");

        //[Authorize(Roles = "SUPERADMIN")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ef_roles>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_roles>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_usuarios>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<ef_usuarios>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_roles rol)
        {
            await _serviceGenerico.Add(rol);
            return Ok(rol);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_roles>> Update([FromBody] ef_roles rol)
        {
            await _serviceGenerico.Update(rol);
            return Ok(rol);
        }

    }
}
