using API.DataSchema.DTO.Roles;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Roles
{
    public interface IRolesService
    {
        Task<List<RolComboDTO>> GetComboEquipoAsync(short idIdioma, string tipoOperacion);
        Task<List<RolComboDTO>> GetComboStaffAsync(short idIdioma, string tipoOperacion);
    }
}