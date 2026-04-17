using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IAudienciasService
    {
        Task<EventoCaptacionRegistroResponse> RegistrarDesdeLinkAsync(string token, EventoCaptacionRegistroRequest req);
        Task<List<AudienciaRegistroEventoDTO>> GetRegistrosEventoAsync(long idUsuario, long idEvento);
        Task<AudienciaEventoMetricasDTO> GetMetricasEventoAsync(long idUsuario, long idEvento);
        Task<List<AudienciaPersonaDTO>> GetAudienciasCuentaAsync(long idUsuario, bool soloActivas = true);
        Task<AudienciaDetalleDTO> GetAudienciaDetalleAsync(long idUsuario, long idAudienciaPersona);
    }
}
