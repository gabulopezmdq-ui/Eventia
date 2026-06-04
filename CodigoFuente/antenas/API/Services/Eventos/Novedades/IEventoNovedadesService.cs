using API.DataSchema.DTO.Eventos.Novedades;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos.Novedades
{
    public interface IEventoNovedadesService
    {
        Task<List<EventoNovedadDTO>> GetByEventoAsync(long idEvento, int idIdioma, bool soloActivas);
        Task<EventoNovedadDTO> GetByIdAsync(long idEvento, long idNovedad, int idIdioma);
        Task<EventoNovedadDTO> CrearAsync(long idEvento, EventoNovedadRequestDTO dto, long idUsuario);
        Task<EventoNovedadDTO> ModificarAsync(long idEvento, long idNovedad, EventoNovedadRequestDTO dto, long idUsuario);
        Task<bool> EliminarAsync(long idEvento, long idNovedad, long idUsuario);
        Task<List<EventoNovedadDTO>> GetPublicByTokenAsync(string token, int idIdioma);
    }
}