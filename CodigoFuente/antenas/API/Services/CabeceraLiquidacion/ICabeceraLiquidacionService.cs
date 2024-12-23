using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;

namespace API.Services
{
    public interface ICabeceraLiquidacionService
    {
        // Método para verificar duplicados
        Task<bool> CheckIfExists(string anio, string mes, int idTipo);

        // Método para agregar una nueva cabecera y su estado
        Task<string> AddCabecera(MEC_CabeceraLiquidacion cabecera, MEC_CabeceraLiquidacionEstados estadoCabecera);

        // Método para agregar la cabecera de liquidación (con estado "P")
        Task SetLiqui(MEC_CabeceraLiquidacion cab);

        // Método para agregar el estado de la cabecera
        Task SeEstados(MEC_CabeceraLiquidacionEstados cab);

    }
}
