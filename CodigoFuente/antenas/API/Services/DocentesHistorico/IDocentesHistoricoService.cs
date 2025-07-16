using System;
using System.Threading.Tasks;

namespace API.Services
{
    // Interfaces/IPartesDiariosService.cs
    public interface IPartesDiariosService
    {
        Task<string> ObtenerHistoricoDocentesAsync(string desde, string hasta, string secretKey);
        string GenerarApiKey(string secretKey, DateTime? timestamp = null);
    }
}