using API.DataSchema.DTO.Planes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public interface IAdminEventoPlanCambiosService
    {
        Task<List<AdminEventoPlanCambioItemDTO>> GetPendientesAsync();
        Task<AdminEventoPlanCambioItemDTO> GetByIdAsync(long id_evento_plan_cambio);
        Task<bool> AprobarAsync(AdminAprobarCambioPlanDTO req, long id_usuario_admin);
        Task<bool> RechazarAsync(AdminRechazarCambioPlanDTO req, long id_usuario_admin);
    }
}