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
        Task<List<EventoResponse>> AdminListarEventosAsync(string? estado = null);
        Task<EventoResponse> AdminGetEventoAsync(long idEvento);
        Task ActivarEventoAdminAsync(long idEvento, long idUsuarioAdmin);

    }
}