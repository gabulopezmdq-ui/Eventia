using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;

namespace API.Services
{
    public interface ICabeceraLiquidacionService
    {
        Task<bool> CheckIfExists(string anio, string mes, int idTipo); // Método para verificar duplicados
        
    }
}
