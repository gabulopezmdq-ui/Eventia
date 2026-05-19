using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema.DTO.Regalos;

namespace API.Services.Regalos
{
    public interface IRegalosTransferenciasService
    {
        Task<List<RegalosTransferenciaDTO>> ListarAsync(long id_evento);
        Task<RegalosTransferenciaDTO> UpsertAsync(RegalosTransferenciaUpsertDTO dto);
        Task<bool> SetActivoAsync(long id_evento, long id_evento_regalo_transferencia, bool activo);
    }
}