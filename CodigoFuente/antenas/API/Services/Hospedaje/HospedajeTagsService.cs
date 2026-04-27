using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class HospedajeTagsService : IHospedajeTagsService
    {
        private readonly DataContext _context;

        public HospedajeTagsService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<ParametricaDTO>> GetAllAsync(short idIdioma)
        {
            const string ENTIDAD = "HOSPEDAJE_TAG";

            var tags = await _context.Set<ef_hospedaje_tags>()
                .AsNoTracking()
                .Where(x => x.activo == true)
                .Select(x => new { x.id_hospedaje_tag, x.codigo, x.orden })
                .ToListAsync();

            var ids = tags.Select(x => (long)x.id_hospedaje_tag).ToArray();

            var trads = await _context.Set<ef_param_traducciones>()
                .AsNoTracking()
                .Where(t =>
                    t.entidad == ENTIDAD &&
                    ids.Contains(t.id_item) &&
                    t.activo == true &&
                    (t.id_idioma == idIdioma || t.id_idioma == 1))
                .Select(t => new { t.id_item, t.id_idioma, t.texto, t.orden })
                .ToListAsync();

            // Diccionario: id_item -> mejor traducción (prioriza idioma pedido, luego es-AR)
            var map = trads
                .GroupBy(t => t.id_item)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(x => x.id_idioma == idIdioma)
                          .ThenByDescending(x => x.id_idioma == 1)
                          .FirstOrDefault()
                );

            var result = tags
                .Select(x =>
                {
                    long idItem = x.id_hospedaje_tag; // short -> long
                    map.TryGetValue(idItem, out var t);

                    return new ParametricaDTO
                    {
                        Id = idItem,
                        Codigo = x.codigo,
                        Texto = t?.texto ?? x.codigo,      // fallback al código
                        Orden = t?.orden ?? x.orden        // fallback al orden del tag
                    };
                })
                .OrderBy(x => x.Orden ?? 9999)
                .ThenBy(x => x.Texto)
                .ToList();

            return result;
        }
    }
}