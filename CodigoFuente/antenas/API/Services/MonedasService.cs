using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Monedas
{
    public class MonedasService : IMonedasService
    {
        private readonly DataContext _context;

        public MonedasService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<MonedaComboDTO>> GetComboAsync(bool? activo = true)
        {
            var q = _context.ef_monedas.AsNoTracking();

            if (activo.HasValue)
                q = q.Where(x => x.activo == activo.Value);

            return await q
                .OrderBy(x => x.orden)
                .ThenBy(x => x.codigo_moneda)
                .Select(x => new MonedaComboDTO
                {
                    codigo_moneda = x.codigo_moneda,
                    nombre = x.nombre,
                    simbolo = x.simbolo,
                    orden = x.orden
                })
                .ToListAsync();
        }
    }
}