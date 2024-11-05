using API.DataSchema;
using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.UsXRol
{
    public interface IUsXRolService
    {
        Task<bool> UpdateRolesAsync(UsuarioRolDto dto);  // Usamos el DTO centralizado aquí
        Task<IEnumerable<object>> GetAllRolesXUsuariosAsync();
        Task<MEC_RolesXUsuarios> AddRolToUsuarioAsync(RolXUsuarioDto dto);
    }
}
