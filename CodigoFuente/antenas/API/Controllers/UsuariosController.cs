using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SuperAdmin, Admin")]
    //[AllowAnonymous]
    [Route("Usuarios")]
    public class UsuariosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_Usuarios> _serviceGenerico;

        public UsuariosController(DataContext context, ILogger<MEC_Usuarios> logger, ICRUDService<MEC_Usuarios> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }

        [AllowAnonymous]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_Usuarios>>> GetAllVigente()
        {
            return Ok(_serviceGenerico.GetAllVigente());
        }


        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_Usuarios>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<MEC_Usuarios>> GetByActivo(bool? usuario)
        {
            var usuarios = await _serviceGenerico.GetByActivo(usuario);
            return Ok(usuarios);
        }

        [HttpGet("GetAllActivos")]
        public ActionResult<IEnumerable<MEC_Usuarios>> GetAllActivos()
        {
            return Ok(_serviceGenerico.GetAllActivos());
        }



        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_Usuarios usuario)
        {
            usuario.Activo = true;
            await _serviceGenerico.Add(usuario);
            return Ok(usuario);
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteUsuario(int Id)
        {
            await _serviceGenerico.DeleteUsuario(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_Usuarios>> Update([FromBody] MEC_Usuarios usuario)
        {
            await _serviceGenerico.Update(usuario);
            return Ok(usuario);
        }
    }
}
