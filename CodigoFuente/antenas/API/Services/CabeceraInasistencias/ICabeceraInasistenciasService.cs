using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO;

namespace API.Services
{
    public interface ICabeceraInasistenciasService
    {
        Task<MEC_InasistenciasCabecera> AddCabeceraAsync(int idCabecera, int idEstablecimiento, int año, int mes);
        Task<bool> CheckIfExists(string anio, string mes, int idTipo, string ordenPago); // Método para verificar duplicados
        Task<string> ProcesarTMPInasistencias(
                                 int idCabeceraLiquidacion,
                                 int idCabeceraInasistencia,
                                 int idEstablecimiento,
                                 string UE);
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
        Task<List<MesAnioDTO?>> ObtenerFechas(int idEstablecimiento, int idCabecera);
        Task<List<CabeceraInasistenciaDTO>> ObtenerCabecerasInas(int idCabecera);
        Task<List<InasistenciasDetalleDTO>> DetalleInasistencia(int idEstablecimiento, int idInasistenciaCabecera);
        Task<bool> EnviarInas(int idInasistenciaCabecera, string observaciones);
        Task<List<MEC_TMPInasistenciasDetalle>> ObtenerInas();
        Task AgregarInasistenciaAsync(int idCabeceraInasistencia,
                                                    int idPOF,
                                                    int idEstablecimiento,
                                                    int idPOFBarra,
                                                    int idTMPInasistenciasDetalle,
                                                    DateTime fecha,
                                                    int? codLicencia,
                                                    int cantHs);
        Task<string> EliminarTMP();
        Task<List<MEC_TMPErroresInasistenciasDetalle>> ObtenerErroresTMPAsync(
      int idCabeceraLiquidacion,
      int idCabeceraInasistencia,
      string UE);
        Task<List<InasEst>> RegistrosProcesados();
        Task<PofConBarrasDTOList> BuscarPOF(string DNI, string Legajo);



        }
}
