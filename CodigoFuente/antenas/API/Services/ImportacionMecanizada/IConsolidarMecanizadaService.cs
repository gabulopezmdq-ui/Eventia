using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.ImportacionMecanizada
{
    public interface IConsolidarMecanizadaService
    {
        Task<List<ConteoConsolidadoResultDTO>> ObtenerConteosConsolidadoAsync(string estadoCabecera);
        Task<bool> HabilitarAccionesAsync(int idEstablecimiento, string estadoCabecera);
        Task<bool> HabilitarCambiarEstadoCabeceraAsync(int idCabecera);
    }
}
