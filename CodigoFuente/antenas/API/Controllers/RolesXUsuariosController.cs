using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using API.Services.UsXRol;
using DocumentFormat.OpenXml.Office2010.Excel;
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
    //[Authorize(Roles = "SuperAdmin")]
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

        [HttpGet("GetAll")]
        public ActionResult<IEnumerable<object>> GetAllVigente()
        {
            // Obtener todos los roles y usuarios
            var rolesXUsuarios = _context.MEC_RolesXUsuarios.ToList();

            // Agrupar y proyectar a un nuevo objeto
            var result = rolesXUsuarios
              .GroupBy(x => x.IdUsuario)
                .Select(g => new
                {
                    IdUsuario = g.Key,
                    NombreUsuario = _context.MEC_Usuarios.FirstOrDefault(u => u.IdUsuario == g.Key)?.Nombre,
                    Roles = g.Select(r => new
                    {
                        IdRol = r.IdRol,
                        NombreRol = _context.MEC_Roles.FirstOrDefault(rol => rol.IdRol == r.IdRol)?.NombreRol,
                    }).ToList(),
                    IdRolXUsuario = g.FirstOrDefault().IdRolXUsuario // Asegúrate de que este campo esté aquí
                })
             .ToList();

            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_RolesXUsuarios>> Get(int Id)
        {
            var usuarioConRolesDetalle = await _userService.GetUsuarioConRolesDetalleById(Id);
            if (usuarioConRolesDetalle == null)
            {
                return NotFound();
            }
            return Ok(usuarioConRolesDetalle);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] UPRolXUsuarioDto dto)
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


        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

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
