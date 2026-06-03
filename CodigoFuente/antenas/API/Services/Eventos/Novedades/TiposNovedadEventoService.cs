using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Eventos.Novedades
{
    public class TiposNovedadEventoService : ITiposNovedadEventoService
    {
        private readonly DataContext _context;

        public TiposNovedadEventoService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<TipoNovedadEventoComboDTO>> ComboAsync(int idIdioma)
        {
            var tipos = await _context.ef_param_tipos_novedad_evento
                .Where(x => x.activo == true)
                .OrderBy(x => x.orden)
                .ToListAsync();

            var idsTipos = tipos
                .Select(x => x.id_tipo_novedad_evento)
                .ToList();

            var traducciones = await _context.ef_param_traducciones
                .Where(x =>
                    x.entidad == "TIPO_NOVEDAD_EVENTO" &&
                    x.id_idioma == idIdioma &&
                    idsTipos.Contains((long)x.id_item)
                )
                .ToListAsync();

            return tipos.Select(t =>
            {
                var trad = traducciones.FirstOrDefault(x => (long)x.id_item == t.id_tipo_novedad_evento);

                return new TipoNovedadEventoComboDTO
                {
                    id_tipo_novedad_evento = t.id_tipo_novedad_evento,
                    codigo = t.codigo,
                    texto = trad != null ? trad.texto : t.codigo
                };
            }).ToList();
        }
    }
}