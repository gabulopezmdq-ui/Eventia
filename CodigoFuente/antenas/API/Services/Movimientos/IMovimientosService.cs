using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO;

namespace API.Services
{
    public interface IMovimientosService
    {
        Task<MEC_MovimientosDetalle> BuscarSuplente(string numDoc);
        Task<(bool Success, string Message)> CrearMovimientoCabeceraAsync(MEC_MovimientosCabecera movimiento);
    }
}
