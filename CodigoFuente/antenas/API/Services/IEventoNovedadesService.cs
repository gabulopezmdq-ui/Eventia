using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IEventoNovedadesService
    {
        Task<List<EventoNovedadDTO>> GetByEventoAsync(long idEvento, int idIdioma, bool soloActivas);
        Task<EventoNovedadDTO> GetByIdAsync(long idEvento, long idNovedad, int idIdioma);
        Task<EventoNovedadDTO> CrearAsync(long idEvento, EventoNovedadRequestDTO dto, long idUsuario);
        Task<EventoNovedadDTO> ModificarAsync(long idEvento, long idNovedad, EventoNovedadRequestDTO dto);
        Task<bool> EliminarAsync(long idEvento, long idNovedad);
        Task<List<EventoNovedadDTO>> GetPublicByTokenAsync(string token, int idIdioma);
    }
}