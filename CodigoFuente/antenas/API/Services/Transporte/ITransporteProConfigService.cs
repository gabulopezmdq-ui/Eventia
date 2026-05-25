using System.Threading.Tasks;
using API.DataSchema.DTO.Transporte;

namespace API.Services.Transporte
{
    public interface ITransporteProConfigService
    {
        Task<TransporteProConfigDTO> GetAsync(long id_evento);
        Task<TransporteProConfigDTO> UpsertAsync(long id_evento, TransporteProConfigUpsertRequest req);
    }
}