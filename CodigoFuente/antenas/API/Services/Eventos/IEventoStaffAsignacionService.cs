using API.DataSchema.DTO.Eventos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public interface IEventoStaffAsignacionService
    {
        Task<List<EventoStaffAsignadoDTO>> GetAsync(long idEvento, long idUsuarioSolicitante, short idIdioma);
        Task<EventoStaffAsignadoDTO> AddDesdeCuentaAsync(long idEvento, AddEventoStaffDesdeCuentaRequest req, long idUsuarioSolicitante, short idIdioma);
        Task<EventoStaffAsignadoDTO> AddNuevoAsync(long idEvento, AddEventoStaffNuevoRequest req, long idUsuarioSolicitante, short idIdioma);
        Task SetActivoAsync(long idEvento, long idEventoStaff, UpdateEventoStaffAsignadoRequest req, long idUsuarioSolicitante);
        Task DeleteAsync(long idEvento, long idEventoStaff, long idUsuarioSolicitante);
    }
}