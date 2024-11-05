using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
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
            var usuarioConRolesDetalle = await _userService.GetUsuarioConRolesDetalleById(Id);
            if (usuarioConRolesDetalle == null)
            {
                return NotFound();
            }
            return Ok(usuarioConRolesDetalle);
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

        //[HttpPut]
        //public async Task<ActionResult<MEC_RolesXUsuarios>> Update([FromBody] UPRolXUsuarioDto dto)
        //{
        //    try
        //    {
        //        // Primero, eliminar los roles actuales asociados al usuario
        //        var rolesActuales = _context.MEC_RolesXUsuarios
        //            .Where(r => r.IdUsuario == dto.IdUsuario)
        //            .ToList();

        //        _context.MEC_RolesXUsuarios.RemoveRange(rolesActuales);

        //        // Luego, agregar los nuevos roles que vienen en la lista `IdRoles`
        //        var nuevosRoles = dto.IdRoles.Select(idRol => new MEC_RolesXUsuarios
        //        {
        //            IdUsuario = dto.IdUsuario,
        //            IdRol = idRol
        //        });

        //        await _context.MEC_RolesXUsuarios.AddRangeAsync(nuevosRoles);

        //        // Guardar cambios en la base de datos
        //        await _context.SaveChangesAsync();

        //        return Ok(new { mensaje = "Roles actualizados exitosamente." });
        //    }

        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { mensaje = ex.Message });
        //    }
        //}

        [HttpPut]
        public async Task<ActionResult<MEC_RolesXUsuarios>> Update([FromBody] UPRolXUsuarioDto dto)
        {
            try
            {
                // Obtener los roles actuales del usuario
                var rolesActuales = _context.MEC_RolesXUsuarios
                    .Where(r => r.IdUsuario == dto.IdUsuario)
                    .ToList();

                // Identificar los roles a eliminar
                var rolesAEliminar = rolesActuales
                    .Where(r => !dto.IdRoles.Contains(r.IdRol))
                    .ToList();

                // Identificar los roles a agregar
                var rolesExistentesIds = rolesActuales.Select(r => r.IdRol).ToHashSet();
                var rolesAAgregar = dto.IdRoles
                    .Where(idRol => !rolesExistentesIds.Contains(idRol))
                    .Select(idRol => new MEC_RolesXUsuarios
                    {
                        IdUsuario = dto.IdUsuario,
                        IdRol = idRol
                    });

                // Eliminar roles que ya no están en la lista de roles del usuario
                _context.MEC_RolesXUsuarios.RemoveRange(rolesAEliminar);

                await _context.MEC_RolesXUsuarios.AddRangeAsync(rolesAAgregar);
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "Roles actualizados exitosamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }
    }
}
