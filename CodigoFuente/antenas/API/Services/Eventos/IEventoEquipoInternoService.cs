using API.DataSchema.DTO.Eventos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos
{
    public interface IEventoEquipoInternoService
    {
        Task<List<EventoEquipoInternoDTO>> GetAsync(long idEvento, long idUsuarioSolicitante, short idIdioma);
        Task<EventoEquipoInternoDTO> AddAsync(long idEvento, AddEventoEquipoInternoRequest req, long idUsuarioSolicitante, short idIdioma);
        Task SetActivoAsync(long idEvento, long idEventoUsuario, UpdateEventoEquipoInternoRequest req, long idUsuarioSolicitante);
        Task DeleteAsync(long idEvento, long idEventoUsuario, long idUsuarioSolicitante);
    }
}