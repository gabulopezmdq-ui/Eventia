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

    }
}
