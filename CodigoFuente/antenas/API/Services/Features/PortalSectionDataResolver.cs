using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DataSchema.DTO.Features;
using API.Services.Features;


namespace API.Services.Features
{
    public class PortalSectionDataResolver
    {
        private readonly Dictionary<string, IPortalSectionProvider> _providers;

        public PortalSectionDataResolver(IEnumerable<IPortalSectionProvider> providers)
        {
            _providers = providers.ToDictionary(x => x.Codigo);
        }

        public async Task<object?> GetDataAsync(
            string codigoSeccion,
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            if (!_providers.ContainsKey(codigoSeccion))
                return null;

            return await _providers[codigoSeccion].GetDataAsync(
                context,
                idIdioma,
                desbloqueadoSensible);
        }
    }
}