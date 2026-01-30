using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IParametricaService
    {
        Task<List<ParametricaDTO>> GetTiposEventoAsync(short idIdioma);
        Task<List<ParametricaDTO>> GetDressCodeAsync(short idIdioma);
    }
}
