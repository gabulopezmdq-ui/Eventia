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
    public class UsuariosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<Usuario> _serviceGenerico;

        public UsuariosController(DataContext context, ILogger<Usuario> logger, ICRUDService<Usuario> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<Usuario>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<Usuario>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<Usuario>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Nombre == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromForm] Usuario usuario)
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
        public async Task<ActionResult<Usuario>> Update([FromBody] Usuario usuario)
        {
            await _serviceGenerico.Update(usuario);
            return Ok(usuario);
        }

    }
}
