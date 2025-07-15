using System;
using System.Threading.Tasks;

namespace API.Services
{
    // Interfaces/IPartesDiariosService.cs
    public interface IPartesDiariosService
    {
        Task<string> ObtenerHistoricoDocentesAsync(DateTime desde, DateTime hasta);
    }

    public interface ITokenService
    {
        string GenerarToken();
    }

    public interface IHistoricoDocentesClient
    {
        Task<string> GetHistoricoDocentes(string url, string apiKey, string token);
    }
}