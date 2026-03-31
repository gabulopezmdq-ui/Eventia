using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IParametricaService
    {
        Task<List<ParametricaDTO>> GetTiposEventoAsync(short idIdioma);
        Task<List<ParametricaDTO>> GetDressCodeAsync(short idIdioma);
        Task<List<ParametricaDTO>> GetTramosTipoAsync(short idIdioma);
        Task<List<ParametricaDTO>> GetPaisesAsync(short idIdioma);
        Task<List<ParametricaDTO>> GetTiposIdentificacionFiscalAsync(short idIdioma);
        Task<List<ParametricaDTO>> GetTiposIdentificacionFiscalByPaisAsync(short idPais, short idIdioma);
    }
}
