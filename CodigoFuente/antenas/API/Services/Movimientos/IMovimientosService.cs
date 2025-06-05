using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;

namespace API.Services
{
    public interface IMovimientosService
    {
        Task<bool> CheckIfExists(string anio, string mes, int idTipo, string ordenPago); // Método para verificar duplicados
        Task<string> AddCabeceraAsync(MEC_CabeceraLiquidacion cabecera);
        Task<string> UpdateCabeceraAsync(MEC_CabeceraLiquidacion cabecera);

    }
}
