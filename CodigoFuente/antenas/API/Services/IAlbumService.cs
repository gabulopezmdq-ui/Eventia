using API.DataSchema;
using API.DataSchema.DTO;
using API.Utility;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IAlbumService
    {
        Task<ef_evento_album_fotos> UploadFotoAsync(long id_evento, long? id_invitado, string? device_id, AlbumUploadDTO dto);
        Task<PagedResult<ef_evento_album_fotos>> GetFeedAsync(long id_evento, AlbumFeedFilterDTO filter);
        Task ModerarFotoAsync(AlbumModeracionDTO dto, long id_usuario_admin);
        Task RegistrarLikeAsync(AlbumLikeDTO dto);
        Task<ef_evento_album_config> GetConfigAsync(long id_evento);
        Task UpdateConfigAsync(long id_evento, AlbumConfigUpdateDTO dto);
    }
}
