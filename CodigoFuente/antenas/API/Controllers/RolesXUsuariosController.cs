using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using API.Services.UsXRol;
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
    [AllowAnonymous]
    [Route("RolesXUsuarios")]
    public class RolesXUsuariosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_RolesXUsuarios> _serviceGenerico;
        private readonly IUserService _userService;
        private readonly IUsXRolService _usXRolService;

        public RolesXUsuariosController(DataContext context, ILogger<MEC_RolesXUsuarios> logger, ICRUDService<MEC_RolesXUsuarios> serviceGenerico, IUserService userService, IUsXRolService usXRolService)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _userService = userService;
            _usXRolService = usXRolService;
        }

        // Obtener todos los roles asociados a los usuarios
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<UsuarioConRolesDetalleDto>>> GetAllVigente()
        {
            var rolesXUsuarios = await _usXRolService.GetAllRolesXUsuariosAsync();

            return Ok(rolesXUsuarios);
        }

        // Obtener un usuario con sus roles por Id
        [HttpGet("GetById")]
        public async Task<ActionResult<UsuarioConRolesDetalleDto>> Get(int Id)
        {
            var usuarioConRolesDetalle = await _userService.GetUsuarioConRolesDetalleById(Id);
            if (usuarioConRolesDetalle == null)
            {
                return NotFound();
            }
            return Ok(usuarioConRolesDetalle);
        }

        // Agregar un rol a un usuario
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] UPRolXUsuarioDto dto)
        {
            try
            {
                // Llamar al servicio para actualizar los roles del usuario
                bool result = await _usXRolService.UpdateRolesAsync(dto);

                if (result)
                {
                    return Ok(new { mensaje = "Roles actualizados exitosamente." });
                }
                else
                {
                    return BadRequest(new { mensaje = "No se pudieron actualizar los roles." });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }


        // Eliminar un rol de un usuario
        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        // Actualizar los roles de un usuario
        [HttpPut]
        public async Task<ActionResult> Update([FromBody] UPRolXUsuarioDto dto)
        {
            try
            {
                bool result = await _usXRolService.UpdateRolesAsync(dto);

                if (result)
                {
                    return Ok(new { mensaje = "Roles actualizados exitosamente." });
                }
                else
                {
                    return BadRequest(new { mensaje = "No se pudieron actualizar los roles." });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}
