using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services
{
    public interface IRestriccionesService
    {
        Task<List<RestriccionCatalogItemDTO>> GetCatalogoAsync(string locale);
        Task<RestriccionesGrupoResponseDTO> GetMisRestriccionesAsync(string rsvpToken);
        Task SaveMisRestriccionesAsync(string rsvpToken, RestriccionesGrupoUpsertDTO dto);
    }

}