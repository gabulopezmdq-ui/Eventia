using API.DataSchema.DTO.Cuentas;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public interface ICuentasService
    {
        Task<CuentaResponseDTO> GetMiCuentaAsync(long id_usuario);
        Task<CuentaResponseDTO> UpdateMiCuentaAsync(long id_usuario, CuentaUpdateRequestDTO request);
    }
}