using System.Collections.Generic;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO;

namespace API.Services
{
    public interface IMovimientosService
    {
        Task<SuplenteResultadoDTO?> BuscarSuplente(string numDoc);

    }
}
