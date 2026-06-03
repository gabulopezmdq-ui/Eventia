using API.DataSchema.DTO;
using API.DataSchema.DTO.Eventos.Agenda;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos.Agenda
{
    public interface IEventoAgendaService
    {
        Task<List<EventoAgendaDTO>> GetByEventoAsync(long idEvento, int idIdioma, bool soloActivas);
        Task<List<EventoAgendaDTO>> GetPublicByTokenAsync(string token, int idIdioma);
        Task<EventoAgendaDTO> GetByIdAsync(long idEvento, long idAgenda, int idIdioma);
        Task<EventoAgendaDTO> CrearAsync(long idEvento, EventoAgendaRequestDTO dto);
        Task<EventoAgendaDTO> ModificarAsync(long idEvento, long idAgenda, EventoAgendaRequestDTO dto);
        Task<bool> EliminarAsync(long idEvento, long idAgenda);
        Task<EventoAgendaImportarTramosResponseDTO> ImportarTramosAsync(long idEvento);
    }
}