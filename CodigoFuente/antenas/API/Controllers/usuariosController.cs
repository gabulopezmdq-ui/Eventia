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
    //[AllowAnonymous]
    [Route("[controller]")]
    public class usuariosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios> _serviceGenerico;
        private readonly ILogger<usuariosController> _logger;

        public usuariosController(DataContext context, ILogger<usuariosController> logger, ICRUDService<ef_usuarios> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [Authorize(Roles = "SUPERADMIN")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ef_usuarios>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_usuarios>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_usuarios>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<ef_usuarios>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_usuarios usuario)
        {
            await _serviceGenerico.Add(usuario);
            return Ok(usuario);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_usuarios>> Update([FromBody] ef_usuarios usuario)
        {
            await _serviceGenerico.Update(usuario);
            return Ok(usuario);
        }

    }
}
