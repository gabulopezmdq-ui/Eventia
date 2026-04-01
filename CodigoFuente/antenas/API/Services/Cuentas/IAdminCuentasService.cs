using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public interface IAdminCuentasService
    {
        Task<List<admin_cuenta_pendiente_dto>> GetPendientesAsync();
        Task<admin_aprobar_cuenta_response> AprobarAsync(admin_aprobar_cuenta_request request, long id_usuario_admin);
        Task<admin_suspender_cuenta_response> SuspenderAsync(admin_suspender_cuenta_request request, long id_usuario_admin);
        Task<admin_cambiar_plan_response> CambiarPlanAsync(admin_cambiar_plan_request request, long id_usuario_admin);
    }
}