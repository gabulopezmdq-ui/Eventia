using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IEventoHospedajesService
    {
        // Admin (usuario autenticado)
        Task<HospedajesAdminGetResponseDTO> GetAdminAsync(long id_usuario, long id_evento);
        Task<bool> SetConfigAsync(long id_usuario, long id_evento, HospedajesConfigDTO config);
        Task<long> UpsertAsync(long id_usuario, long id_evento, HospedajeUpsertRequestDTO req);
        Task<bool> DeleteAsync(long id_usuario, long id_evento, long id_hospedaje);

        // Public (invitación)
        Task<HospedajesPublicGetResponseDTO> GetPublicAsync(long id_evento, string? rsvp_token);
        Task<byte[]> BuildGuiaPdfAsync(long id_evento, string? rsvp_token);
    }
}
