using API.DataSchema.DTO.Staff;
using System;
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
        Task<StaffCreadoDTO> RenovarCodigoAsync(long idCuenta, long idStaff, DateTimeOffset? fechaExpiracion);
        Task<StaffListItemDTO> GetByIdAsync(long idCuenta, long idStaff);
        Task<StaffListItemDTO> UpdateStaffAsync(long idCuenta, long idStaff, API.DataSchema.DTO.Staff.StaffUpdateRequest req);
        //Task<bool> EliminarStaffAsync(long idCuenta, long idStaff);
    }
}
