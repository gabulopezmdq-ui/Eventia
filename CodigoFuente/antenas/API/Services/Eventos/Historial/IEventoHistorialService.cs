using API.DataSchema.DTO.Eventos.Historial;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos.Historial
{
    public interface IEventoHistorialService
    {
        Task RegistrarAsync(
            long idEvento,
            string modulo,
            string accion,
            string? entidad,
            long? idEntidad,
            string descripcion,
            long? idUsuario);

        Task<List<EventoHistorialDTO>> GetByEventoAsync(
            long idEvento,
            string? modulo,
            int take);
    }
}