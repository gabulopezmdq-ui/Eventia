using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin")]
    [AllowAnonymous]
    [Route("RolesXUsuarios")]
    public class RolesXUsuariosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_RolesXUsuarios> _serviceGenerico;

        public RolesXUsuariosController(DataContext context, ILogger<MEC_RolesXUsuarios> logger, ICRUDService<MEC_RolesXUsuarios> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_RolesXUsuarios>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_RolesXUsuarios>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] RolXUsuarioDto dto)
        {
            var rolXUsuario = new MEC_RolesXUsuarios
            {
                IdRol = dto.IdRol,
                IdUsuario = dto.IdUsuario
            };

            await _serviceGenerico.Add(rolXUsuario);
            return Ok(rolXUsuario);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_RolesXUsuarios>> Update([FromBody] UPRolXUsuarioDto dto)
        {
            var rolXUsuario = new MEC_RolesXUsuarios
            {
                IdRolXUsuario = dto.IdRolXUsuario,
                IdRol = dto.IdRol,
                IdUsuario = dto.IdUsuario
            };
            await _serviceGenerico.Update(rolXUsuario);
            return Ok(rolXUsuario);
        }
    }
}
