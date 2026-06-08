using System.Threading.Tasks;
using API.DataSchema.DTO.Features;
using API.Services.Features;

namespace API.Services.Features
{
    public interface IPortalSectionProvider
    {
        string Codigo { get; }

        Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible);
    }
}