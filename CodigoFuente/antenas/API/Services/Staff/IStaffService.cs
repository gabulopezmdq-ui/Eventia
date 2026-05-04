using API.DataSchema.DTO.Staff;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Staff
{
    public interface IStaffService
    {
        Task<StaffCreadoDTO> CrearStaffAsync(CrearStaffRequest req);
        Task<StaffCreadoDTO> CrearStaffEventoAsync(long idEvento, string nombre, string apellido, string email, short idRol);
        Task<List<StaffListItemDTO>> ListarStaffAsync(long id_cuenta);
        Task<bool> RevocarStaffAsync(long id_cuenta, long id_staff);
        Task<StaffContextoDTO> UsarCodigoAsync(string codigo);
    }
}
