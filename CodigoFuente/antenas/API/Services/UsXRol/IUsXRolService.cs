using API.DataSchema.DTO;
using System.Threading.Tasks;

namespace API.Services.UsXRol
{
    public interface IUsXRolService
    {
        Task<bool> UpdateRolesAsync(UPRolXUsuarioDto dto);
    }
}

