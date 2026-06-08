using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features.Sections;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class AgendaPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "AGENDA";

        public AgendaPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            if (context.EsEvento && context.IdAcceso.HasValue)
            {
                return await (
                    from at in _context.ef_evento_acceso_tramos.AsNoTracking()
                    join t in _context.ef_evento_tramos.AsNoTracking()
                        on at.id_tramo equals t.id_tramo
                    where at.id_acceso == context.IdAcceso.Value
                       && t.activo == true
                    orderby t.fecha_hora_inicio, t.orden
                    select new
                    {
                        id_tramo = t.id_tramo,
                        nombre = t.nombre,
                        leyenda_visible = t.leyenda_visible,
                        fecha_hora_inicio = t.fecha_hora_inicio,
                        fecha_hora_fin = t.fecha_hora_fin,
                        lugar = t.lugar,
                        direccion = t.direccion,
                        latitud = t.latitud,
                        longitud = t.longitud,
                        orden = t.orden
                    }
                ).ToListAsync();
            }

            return await (
                from a in _context.ef_evento_agenda.AsNoTracking()
                join tipo in _context.ef_param_tipos_agenda_evento.AsNoTracking()
                    on a.id_tipo_agenda_evento equals tipo.id_tipo_agenda_evento
                where a.id_evento == context.IdEvento
                   && a.activo == true
                   && a.visible_publico == true
                orderby a.fecha, a.dia_semana, a.hora_inicio, a.orden
                select new
                {
                    id_agenda = a.id_agenda,
                    id_tipo_agenda_evento = a.id_tipo_agenda_evento,
                    tipo_codigo = tipo.codigo,
                    titulo = a.titulo,
                    descripcion = a.descripcion,
                    dia_semana = a.dia_semana,
                    fecha = a.fecha,
                    hora_inicio = a.hora_inicio,
                    hora_fin = a.hora_fin,
                    orden = a.orden
                }
            ).ToListAsync();
        }
    }
}