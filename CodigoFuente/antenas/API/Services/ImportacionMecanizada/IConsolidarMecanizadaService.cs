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

        Task<List<MECPOFDetalleDTO>> ObtenerRegistrosPOFNoMecanizadosAsync(int idCabecera, int idEstablecimiento);

        Task<bool> ValidarExistenciaAntiguedadAsync(int idPOF);

        Task<bool> ProcesarAltaMecanizadaAsync(AltaMecanizadaDTO datos);

        Task<bool> EliminarRegistroMECMecanizadaAsync(int idMecanizada);
    }
}
