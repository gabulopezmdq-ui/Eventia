using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;

namespace API.Services
{
    public interface ICabeceraLiquidacionService
    {
        Task<bool> CheckIfExists(string anio, string mes, int idTipo); // Método para verificar duplicados
        Task<MEC_CabeceraLiquidacion> CreateAsync(MEC_CabeceraLiquidacion cabeceraLiquidacion);
        Task<MEC_CabeceraLiquidacion> UpdateAsync(MEC_CabeceraLiquidacion cabeceraLiquidacion);
        Task DeleteAsync(int id);
        Task<IEnumerable<MEC_CabeceraLiquidacion>> GetAllAsync();
        Task<MEC_CabeceraLiquidacion> GetByIdAsync(int id);
    }
}
