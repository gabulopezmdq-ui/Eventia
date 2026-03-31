using API.DataSchema.DTO.Cuentas;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public interface ICuentasService
    {
        Task<CuentaResponseDTO> GetMiCuentaAsync(long id_usuario);
        Task<CuentaResponseDTO> UpdateMiCuentaAsync(long id_usuario, CuentaUpdateRequestDTO request);
        Task<cuenta_solicitar_response> SolicitarCuentaAsync(long id_usuario, cuenta_solicitar_request request);
    }
}