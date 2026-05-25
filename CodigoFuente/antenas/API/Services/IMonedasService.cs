using API.DataSchema.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Services.Monedas
{
    public interface IMonedasService
    {
        Task<List<MonedaComboDTO>> GetComboAsync(bool? activo = true);
    }
}