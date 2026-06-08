using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features.Sections;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class NovedadesPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "NOVEDADES";

        public NovedadesPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            var now = DateTimeOffset.UtcNow;

            return await (
                from n in _context.ef_evento_novedades.AsNoTracking()
                join t in _context.ef_param_tipos_novedad_evento.AsNoTracking()
                    on n.id_tipo_novedad_evento equals t.id_tipo_novedad_evento
                where n.id_evento == context.IdEvento
                   && n.activo == true
                   && n.publicado == true
                   && (n.visible_desde == null || n.visible_desde <= now)
                   && (n.visible_hasta == null || n.visible_hasta >= now)
                orderby n.destacada descending, n.orden, n.fecha_alta descending
                select new
                {
                    id_novedad = n.id_novedad,
                    id_tipo_novedad_evento = n.id_tipo_novedad_evento,
                    tipo_codigo = t.codigo,
                    titulo = n.titulo,
                    descripcion = n.descripcion,
                    importante = n.importante,
                    destacada = n.destacada,
                    orden = n.orden,
                    url_adjunto = n.url_adjunto,
                    tipo_adjunto = n.tipo_adjunto,
                    fecha_alta = n.fecha_alta
                }
            ).ToListAsync();
        }
    }
}