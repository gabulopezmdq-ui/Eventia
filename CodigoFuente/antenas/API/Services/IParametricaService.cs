using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IParametricaService
    {
        Task<List<ParametricaDTO>> GetAsync(
            string entidad,
            short idIdioma);
    }
}
