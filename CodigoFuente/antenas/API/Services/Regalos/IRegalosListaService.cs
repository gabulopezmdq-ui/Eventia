using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema.DTO.Regalos;

namespace API.Services.Regalos
{
    public interface IRegalosListaService
    {
        Task<List<RegalosListaItemDTO>> ListarItemsAsync(long id_evento);
        Task<RegalosListaItemDTO> CrearItemAsync(RegalosListaCrearItemDTO req);
        Task<bool> SetVisibleItemAsync(long id_evento, long id_regalo_item, bool visible);

        Task<RegalosListaReservaDTO> ReservarAsync(RegalosListaReservarDTO req);
        Task<bool> CancelarReservaAsync(long id_evento, long id_reserva);
    }
}