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
        Task<QrEntradaResolucionDTO> ResolverQrEntradaAsync(long idUsuario, long idEvento, string qrToken);
        Task<List<AudienciaBusquedaRegistradoDTO>> BuscarRegistradoAsync(long idUsuario, long idEvento, string? query);
        Task<QrEntradaResolucionDTO> ResolverEntradaManualAsync(long idUsuario, long idEvento, long idInvitado);
        Task<QrBeneficioResolucionDTO> ResolverQrBeneficioAsync(long idUsuario, long idEvento, string qrToken);
        Task<List<AudienciaTagSugeridoDTO>> GetTagsSugeridosAsync(long idUsuario);
        Task<AudienciaTagDTO> AgregarTagAsync(long idUsuario, long idAudienciaPersona, AudienciaTagCreateRequest req);
        Task SetTagActivoAsync(long idUsuario, long idAudienciaPersonaTag, bool activo);
        Task<List<AudienciaPendienteManualBeneficioDTO>> GetPendientesManualBeneficioAsync(long idUsuario, long idEvento);
    }
}
