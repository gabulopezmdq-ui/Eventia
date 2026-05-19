using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema.DTO.Regalos;

namespace API.Services.Regalos
{
    public interface IRegalosFondoService
    {
        Task<RegalosFondoDTO?> GetFondoByEventoAsync(long id_evento);
        Task<RegalosFondoDTO> UpsertFondoAsync(RegalosFondoUpsertDTO req);

        Task<List<RegalosFondoMetaDTO>> ListarMetasAsync(long id_evento);
        Task<RegalosFondoMetaDTO> CrearMetaAsync(RegalosFondoCrearMetaDTO req);
        Task<bool> SetVisibleMetaAsync(long id_evento, long id_meta, bool visible);

        Task<RegalosFondoAporteDTO> CrearAportePublicoAsync(RegalosFondoCrearAporteDTO req);
        Task<bool> ConfirmarAporteAsync(long id_evento, long id_aporte, long id_usuario_admin, RegalosFondoConfirmarAporteDTO req);
    }
}