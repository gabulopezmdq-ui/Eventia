using System.Threading.Tasks;
using API.DataSchema.DTO.Transporte;

namespace API.Services.Transporte
{
    public interface ITransporteEventoService
    {
        Task<TransporteEventoDTO> GetByEventoAsync(long id_evento);
        Task<TransporteEventoDTO> UpsertAsync(long id_evento, TransporteEventoUpsertRequest req);
    }
}