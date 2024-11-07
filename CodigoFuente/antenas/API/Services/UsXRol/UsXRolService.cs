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
        public async Task<IEnumerable<UsuarioConRolesDetalleDto>> GetAllRolesXUsuariosAsync()
        {
            var rolesXUsuarios = await _context.MEC_RolesXUsuarios.ToListAsync();

            var result = rolesXUsuarios
                .GroupBy(x => x.IdUsuario)
                .Select(g => new UsuarioConRolesDetalleDto
                {
                    IdUsuario = g.Key,
                    NombreUsuario = _context.MEC_Usuarios.FirstOrDefault(u => u.IdUsuario == g.Key)?.Nombre,
                    Roles = g.Select(r => new RolDetalleDto
                    {
                        IdRol = r.IdRol,
                        NombreRol = _context.MEC_Roles.FirstOrDefault(rol => rol.IdRol == r.IdRol)?.NombreRol,
                        Vigente = _context.MEC_Roles.FirstOrDefault(rol => rol.IdRol == r.IdRol)?.Vigente
                    }).ToList()
                })
                .ToList();

            return result;
        }

        // Actualizar los roles de un usuario usando el DTO centralizado
        public async Task<bool> UpdateRolesAsync(UPRolXUsuarioDto dto)
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

            // Agregar nuevos roles
            await _context.MEC_RolesXUsuarios.AddRangeAsync(rolesAAgregar);

            // Guardar cambios
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
