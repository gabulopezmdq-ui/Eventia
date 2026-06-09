using API.DataSchema.DTO.Planes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public interface IAdminCuentaPlanCambiosService
    {
        Task<List<CuentaCambioPlanDTO>> GetPendientesAsync();
        Task<CuentaCambioPlanDTO> GetByIdAsync(long id_cuenta_plan_cambio);
        Task<bool> AprobarAsync(AdminAprobarCambioPlanCuentaDTO req, long id_usuario_admin);
        Task<bool> RechazarAsync(AdminRechazarCambioPlanCuentaDTO req, long id_usuario_admin);
    }
}