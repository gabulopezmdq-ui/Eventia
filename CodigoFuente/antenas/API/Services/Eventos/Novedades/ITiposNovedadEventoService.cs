using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Eventos.Novedades
{
    public interface ITiposNovedadEventoService
    {
        Task<List<TipoNovedadEventoComboDTO>> ComboAsync(int idIdioma);
    }
}