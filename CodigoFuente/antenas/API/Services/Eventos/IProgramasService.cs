using API.DataSchema.DTO.Programas;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public interface IProgramasService
    {
        Task<IEnumerable<object>> GetStaffAsync(long idEvento, long idUsuarioLogger);
        Task<object> AddStaffAsync(long idEvento, AddProgramaStaffRequest req, long idUsuarioLogger);
        Task<bool> UpdateStaffAsync(long idEvento, long idEventoUsuario, UpdateProgramaStaffRequest req, long idUsuarioLogger);
        Task<bool> DeleteStaffAsync(long idEvento, long idEventoUsuario, long idUsuarioLogger);
        Task<object> AceptarInvitacionStaffAsync(string token, long idUsuarioActual);
    }
}
