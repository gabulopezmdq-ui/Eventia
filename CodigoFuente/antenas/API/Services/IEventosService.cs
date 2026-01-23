using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IEventosService
    {
        Task<EventoResponse> CrearEventoAsync(long idUsuario, EventoCreateRequest req);
        Task<List<EventoResponse>> MisEventosAsync(long idUsuario);
        Task<EventoResponse> GetEventoMioAsync(long idUsuario, long idEvento);
    }
}