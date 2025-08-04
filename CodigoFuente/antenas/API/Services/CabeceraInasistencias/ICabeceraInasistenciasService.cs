using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;

namespace API.Services
{
    public interface ICabeceraInasistenciasService
    {
        Task<bool> AddCabeceraAsync(int idCabecera);
        Task<bool> CheckIfExists(string anio, string mes, int idTipo, string ordenPago); // Método para verificar duplicados
        Task ProcesarTMPInasistencias(int idCabeceraLiquidacion, int idCabeceraInasistencia, int idEstablecimiento, string UE);
        Task<List<MEC_InasistenciasCabecera>> ObtenerCabecerasHabilitadasAsync();
        Task<(bool Exito, string? Mensaje)> DevolverAEstablecimientoAsync(
                                                                            int idCabecera,
                                                                            int usuario,
                                                                            string motivoRechazo);

        Task<(bool Exito, string? Mensaje)> CorregidoEducacion(int? idCabecera);
        Task<List<InasistenciaCabeceraDTO>> ObtenerCabeceraInasistenciasAsync(int idUsuario);
        Task<DetalleRechazos> ObtenerDetalleYRechazosPorCabeceraAsync(int idCabecera);
        Task<List<MecanizadasDTO>> ObtenerMecanizadas(int idCabecera, int idEstablecimiento);
        Task<(bool Exito, string? Mensaje)> GuardarInasistenciaAsync(MEC_InasistenciasDetalle inasistencia);
        Task<InasistenciaCabeceraDTO?> ObtenerInasistenciaPorPeriodoAsync(int idEstablecimiento, int anio, int mes);
        Task<List<MesAnioDTO?>> ObtenerFechas(int idCabecera);


    }
}
