using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO;
using static API.DataSchema.DTO.ReporteMovDTO;

namespace API.Services
{
    public interface IMovimientosService
    {
        Task<MEC_MovimientosDetalle> BuscarSuplente(string numDoc);
        Task<(bool Success, string Message, int? IdMovimientoCabecera)> CrearMovimientoCabeceraAsync(MEC_MovimientosCabecera movimiento);
        Task<(bool Success, string Message, int? Anio, int? Mes)> CalcularAntiguedadAsync(int idMovimientoCabecera);
        Task<bool> EnviarProv(MEC_MovimientosCabecera movimientos);
        Task<bool> EnviarEduc(MEC_MovimientosCabecera movimientos);
        Task MovimientoAlta(MovimientosDetalleDTO dto);
        Task<List<MovimientosDetalleDTO>> ObtenerDetallesPorCabeceraAsync(int idCabecera);

        //SERVICIOS BAJAS
        Task<List<MECPOFDetalleDTO>> ObtenerPOFPorEstablecimientoAsync(int idEstablecimiento);

        //BUSCAR POF
        Task<List<MECPOFDetalleDTO>> BuscarPOFAsync(int idEstablecimiento);

        // REPORTE
        Task<ReporteEstablecimientoDTO?> Reporte(int idMovimientoCabecera);

        //MOVIMIENTO BAJAS DESDE MOVIMIENTOSDETALLE
        Task<bool> DetalleBaja(MEC_MovimientosDetalle nuevoDetalle);

        //ROLES USUARIOS
        Task<List<int>> ObtenerIdsPorUsuarioAsync(int idUsuario);
    }
}
