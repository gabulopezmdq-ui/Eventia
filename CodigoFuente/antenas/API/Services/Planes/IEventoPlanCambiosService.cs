using API.DataSchema.DTO.Planes;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public interface IEventoPlanCambiosService
    {
        Task<CambioPlanDTO> SolicitarCambioPlanAsync(long id_evento, long id_usuario, SolicitarCambioPlanDTO req);
        Task<CambioPlanDTO?> GetPendienteEventoAsync(long id_evento, long id_usuario);
    }
}