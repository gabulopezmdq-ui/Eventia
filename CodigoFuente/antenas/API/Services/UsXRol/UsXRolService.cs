using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace API.Services.UsXRol
{
    public class UsXRolService : IUsXRolService
    {
        private readonly DataContext _context;

        public UsXRolService(DataContext context)
        {
            _context = context;
        }

        // Obtener todos los roles asociados a los usuarios
        public async Task<IEnumerable<object>> GetAllRolesXUsuariosAsync()
        {
            var rolesXUsuarios = await _context.MEC_RolesXUsuarios.ToListAsync();

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
                    IdRolXUsuario = g.FirstOrDefault()?.IdRolXUsuario
                })
                .ToList();

            return result;
        }

        // Actualizar los roles de un usuario usando el DTO centralizado
        public async Task<bool> UpdateRolesAsync(UsuarioRolDto dto)
        {
            var rolesXUsuarios = new List<MEC_RolesXUsuarios>();

            foreach (var usuario in dto.UsuariosConRolesDetalle)
            {
                rolesXUsuarios.AddRange(usuario.Roles.Select(role => new MEC_RolesXUsuarios
                {
                    IdUsuario = usuario.IdUsuario,
                    IdRol = role.IdRol
                }));
            }

            var rolesActuales = _context.MEC_RolesXUsuarios
                .Where(r => r.IdUsuario == rolesXUsuarios.FirstOrDefault()?.IdUsuario)
                .ToList();

            var rolesAEliminar = rolesActuales
                .Where(r => !rolesXUsuarios.Any(x => x.IdRol == r.IdRol))
                .ToList();

            var rolesAAgregar = rolesXUsuarios
                .Where(r => !rolesActuales.Any(x => x.IdRol == r.IdRol))
                .ToList();

            _context.MEC_RolesXUsuarios.RemoveRange(rolesAEliminar);

            await _context.MEC_RolesXUsuarios.AddRangeAsync(rolesAAgregar);

            return await _context.SaveChangesAsync() > 0;
        }

        // Agregar un nuevo rol a un usuario
        public async Task<MEC_RolesXUsuarios> AddRolToUsuarioAsync(RolXUsuarioDto dto)
        {
            var rolXUsuarioExistente = await _context.MEC_RolesXUsuarios
                .FirstOrDefaultAsync(r => r.IdUsuario == dto.IdUsuario && r.IdRol == dto.IdRol);

            if (rolXUsuarioExistente != null)
            {
                return null; // El usuario ya tiene este rol
            }

            var rolXUsuario = new MEC_RolesXUsuarios
            {
                IdUsuario = dto.IdUsuario,
                IdRol = dto.IdRol
            };

            await _context.MEC_RolesXUsuarios.AddAsync(rolXUsuario);
            await _context.SaveChangesAsync();

            return rolXUsuario;
        }
    }
}
