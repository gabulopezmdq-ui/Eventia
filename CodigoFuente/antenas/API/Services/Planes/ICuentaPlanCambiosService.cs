using API.DataSchema.DTO.Planes;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public interface ICuentaPlanCambiosService
    {
        Task<CuentaCambioPlanDTO> SolicitarCambioPlanAsync(long id_cuenta, long id_usuario, SolicitarCambioPlanCuentaDTO req);
        Task<CuentaCambioPlanDTO?> GetPendienteCuentaAsync(long id_cuenta, long id_usuario);
    }
}