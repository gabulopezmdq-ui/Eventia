using API.DataSchema.DTO.Eventos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public interface IEventoStaffOperativoService
    {
        Task<List<EventoStaffOperativoDTO>> GetAsync(long idEvento, long idUsuarioSolicitante, short idIdioma);
        Task<EventoStaffOperativoDTO> AddAsync(long idEvento, AddEventoStaffOperativoRequest req, long idUsuarioSolicitante, short idIdioma);
        Task SetActivoAsync(long idEvento, long idStaff, UpdateEventoStaffOperativoRequest req, long idUsuarioSolicitante);
        Task DeleteAsync(long idEvento, long idStaff, long idUsuarioSolicitante);
    }
}