using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IEventoCaptacionLinksService
    {
        Task<List<EventoCaptacionLinkDTO_>> GetByEventoAsync(long idUsuario, long idEvento, bool esSuperadmin = false);
        Task<EventoCaptacionLinkDTO_> GetByIdAsync(long idUsuario, long idAccesoLink, bool esSuperadmin = false);
        Task<EventoCaptacionLinkDTO_> UpsertAsync(long idUsuario, long idEvento, EventoCaptacionLinkUpsertRequest req, bool esSuperadmin = false);
        Task<object> SetActivoAsync(long idUsuario, long idAccesoLink, bool activo, bool esSuperadmin = false);
        Task<EventoCaptacionLandingDTO> GetLandingAsync(string token);
    }
}