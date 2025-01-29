using API.DataSchema.DTO;
using API.DataSchema;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.ImportacionMecanizada
{
    public interface IConsolidarMecanizadaService
    {
        Task<object> ObtenerConteosConsolidadoAsync(int idCabecera);
        Task<bool> HabilitarAccionesAsync(int idEstablecimiento, string estadoCabecera);
        Task<bool> HabilitarCambiarEstadoCabeceraAsync(int idCabecera);
        Task<List<MEC_POF>> ObtenerRegistrosPOFNoMecanizadosAsync(int idCabecera, int idEstablecimiento);
    }
}
