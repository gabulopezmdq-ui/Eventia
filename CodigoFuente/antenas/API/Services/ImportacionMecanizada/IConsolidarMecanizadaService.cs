using API.DataSchema.DTO;
using API.DataSchema;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

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

        Task CrearRegistroAntigDet(AltaMecanizadaDTO datos);
        Task<List<SuplentesDTO>> ObtenerSuplentesAsync(int idCabecera, int idEstablecimiento);
        Task<List<MecanizadasDTO>> ObtenerMecanizadas(int idCabecera, int idEstablecimiento);
        Task<List<object>> ObtenerPOFsSimplificadoAsync(int idEstablecimiento);
        Task ActualizarMEC_POFDetalle(int idPOF, int supleAId, int idCabecera, DateTime supleDesde, DateTime supleHasta);
        Task ConsolidarRegistrosAsync(int idCabecera, int idEstablecimiento, int usuario);
        Task CambiarEstadoCabeceraAsync(int idCabecera, int usuario);
        Task<MecReporteRespuestaDTO> ObtenerReporte(int idCabecera, int idEstablecimiento);
        Task DesconsolidarAsync(int idCabecera, int idEstablecimiento);
        Task<List<RetencionDTO>> ObtenerRetencionesDTOAsync(int idEstablecimiento, int idCabecera);
    }
}