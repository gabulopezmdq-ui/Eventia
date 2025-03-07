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
        Task<List<MEC_Mecanizadas>> ObtenerSuplentesAsync(int idCabecera, int idEstablecimiento);
        Task<List<MEC_Mecanizadas>> ObtenerMecanizadas(int idCabecera, int idEstablecimiento);
        Task<List<object>> ObtenerPOFsSimplificadoAsync(int idEstablecimiento);
        Task ActualizarMEC_POFDetalle(MEC_POFDetalle detalle);
    }
}
