using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IEventoCaptacionLinksService
    {
        Task<List<EventoCaptacionLinkDTO_>> GetByEventoAsync(long idUsuario, long idEvento);
        Task<EventoCaptacionLinkDTO_> GetByIdAsync(long idUsuario, long idAccesoLink);
        Task<EventoCaptacionLinkDTO_> UpsertAsync(long idUsuario, long idEvento, EventoCaptacionLinkUpsertRequest req);
        Task<object> SetActivoAsync(long idUsuario, long idAccesoLink, bool activo);
        Task<EventoCaptacionLandingDTO> GetLandingAsync(string token);
    }
}