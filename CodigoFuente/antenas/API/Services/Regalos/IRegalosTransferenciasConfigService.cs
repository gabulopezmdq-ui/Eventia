using System.Threading.Tasks;
using API.DataSchema.DTO.Regalos;

namespace API.Services.Regalos
{
    public interface IRegalosTransferenciasConfigService
    {
        Task<RegalosTransferenciasConfigDTO> GetAsync(long id_evento);
        Task<RegalosTransferenciasConfigDTO> UpsertAsync(long id_evento, RegalosTransferenciasConfigUpsertDTO dto);
    }
}