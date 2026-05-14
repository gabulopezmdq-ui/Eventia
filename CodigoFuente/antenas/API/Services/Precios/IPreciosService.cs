using API.DataSchema.DTO.Precios;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Precios
{
    public interface IPreciosService
    {
        Task<List<PrecioPlanDTO>> GetPlanesAsync(string tipo, string codigo_mercado);
        Task<PrecioPlanDTO> GetPrecioPlanAsync(string codigo_plan, string codigo_mercado);
    }
}