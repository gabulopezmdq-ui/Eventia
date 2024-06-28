using API.DataSchema;
using API.Services;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles ="Admin")]
    [AllowAnonymous]
    [Route("Controller")]
    public class ANT_UsuarioController :ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_Usuario> _serviceGenerico;

        public ANT_UsuarioController(DataContext context, ILogger<ANT_Usuario> logger , ICRUDService<ANT_Usuario> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_Usuario>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_Usuario>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ANT_Usuario usuario)
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
        public async Task<ActionResult<ANT_Usuario>> Update([FromBody] ANT_Usuario usuario)
        {
            await _serviceGenerico.Update(usuario);
            return Ok(usuario);
        }
    }
}
