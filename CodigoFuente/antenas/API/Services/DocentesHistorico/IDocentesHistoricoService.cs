using System;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IPartesDiariosService
    {
        Task<string> ObtenerHistoricoDocentesAsync(DateTime desde, DateTime hasta);

        string GenerarToken();
    }
}