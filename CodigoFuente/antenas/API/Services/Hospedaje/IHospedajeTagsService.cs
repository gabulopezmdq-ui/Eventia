using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IHospedajeTagsService
    {
        Task<List<ParametricaDTO>> GetAllAsync(short idIdioma);
    }
}
