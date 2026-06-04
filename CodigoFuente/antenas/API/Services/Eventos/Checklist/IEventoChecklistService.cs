using API.DataSchema.DTO.Eventos.Checklist;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos.Checklist
{
    public interface IEventoChecklistService
    {
        Task<List<EventoChecklistDTO>> GetByEventoAsync(long idEvento, int idIdioma, bool soloActivos, bool? completado);
        Task<EventoChecklistDTO> GetByIdAsync(long idEvento, long idChecklist, int idIdioma);
        Task<EventoChecklistDTO> CrearAsync(long idEvento, EventoChecklistRequestDTO dto, long idUsuario);
        Task<EventoChecklistDTO> ModificarAsync(long idEvento, long idChecklist, EventoChecklistRequestDTO dto, long idUsuario);
        Task<EventoChecklistDTO> SetCompletadoAsync(long idEvento, long idChecklist, bool completado, long idUsuario);
        Task<bool> EliminarAsync(long idEvento, long idChecklist);
    }
}