using API.DataSchema;
using API.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IO.Compression;
using DocumentFormat.OpenXml.InkML;
using API.DataSchema.DTO;

namespace API.Services
{
    public class UserService : IUserService
    {
        private readonly DataContext _context;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(IHttpContextAccessor httpContextAccessor, DataContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        public int GetAuthenticatedUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
            if (userIdClaim == null)
            {
                throw new Exception("Usuario no autenticado.");
            }
            return int.Parse(userIdClaim.Value);
        }

        public async Task VerifRol(MEC_RolesXUsuarios rolXUsuario)
        {
            // Verificar si ya existe la combinación de UsuarioId y RolId
            bool exists = await _context.MEC_RolesXUsuarios
                .AnyAsync(rx => rx.IdUsuario == rolXUsuario.IdUsuario && rx.IdRol == rolXUsuario.IdRol);

            if (exists)
            {
                throw new InvalidOperationException("El usuario ya tiene este rol asignado.");
            }

            // Si no existe, agregar el nuevo rol
            _context.MEC_RolesXUsuarios.Add(rolXUsuario);
            await _context.SaveChangesAsync();
        }
        public async Task<UsuarioConRolesDetalleDto> GetUsuarioConRolesDetalleById(int id)
        {
            var usuario = await _context.MEC_Usuarios
                .Where(u => u.IdUsuario == id)
                .Include(u => u.UsuariosXRoles)
                    .ThenInclude(ur => ur.Rol)
                .Select(u => new UsuarioConRolesDetalleDto
                {
                    IdUsuario = u.IdUsuario,
                    NombreUsuario = u.Nombre,
                    Email = u.Email,
                    Activo = u.Activo ?? false,
                    Roles = u.UsuariosXRoles.Select(ur => new RolDetalleDto
                    {
                        IdRol = ur.Rol.IdRol,
                        NombreRol = ur.Rol.NombreRol,
                        Vigente = ur.Rol.Vigente
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return usuario;
        }
    }
}