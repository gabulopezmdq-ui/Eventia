using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;

namespace API.Services
{
    public interface IAprobarInasistenciasService
    {
        Task<List<MEC_InasistenciasDetalle>> ObtenerDetallesPendientes();
        Task<bool> AceptarInas(int idInasDetalle);
        Task<bool> RechazarInas(int idInasDetalle, string observaciones);
        Task<bool> AgregarDetalle(MEC_InasistenciasDetalle detalle);
        Task<List<MEC_InasistenciasDetalle>> ObtenerInasEduc(int idInasistenciaCabecera);
        Task<bool> EnviarInas(List<int> idInasistencias);
        Task<bool> EnviarEduc(int idCabecera, string observaciones);

    }
}
