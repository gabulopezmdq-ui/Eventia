using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
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

        public RolesXUsuariosController(DataContext context, ILogger<MEC_RolesXUsuarios> logger, ICRUDService<MEC_RolesXUsuarios> serviceGenerico, IUserService userService)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _userService = userService;
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
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] RolXUsuarioDto dto)
        {
            try
            {
                var rolXUsuario = new MEC_RolesXUsuarios
                {
                    IdRol = dto.IdRol,
                    IdUsuario = dto.IdUsuario
                };

                // Verificar si el usuario ya tiene este rol
                if (await _serviceGenerico.UserDuplicate(rolXUsuario))
                {
                    return BadRequest(new { mensaje = "El usuario ya tiene este rol." });
                }

                await _serviceGenerico.Add(rolXUsuario);
                return Ok(rolXUsuario);
            }
            catch (InvalidOperationException ex)
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
