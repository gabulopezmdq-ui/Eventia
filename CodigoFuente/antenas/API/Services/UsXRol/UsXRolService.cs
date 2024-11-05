using API.DataSchema.DTO;
using API.DataSchema;
using System.Threading.Tasks;
using System.Linq;

namespace API.Services.UsXRol
{
    public class UsXRolService : IUsXRolService
    {

        private readonly DataContext _context;

        public UsXRolService(DataContext context)
        {
            _context = context;
        }

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
    }
}