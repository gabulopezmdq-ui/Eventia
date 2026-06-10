using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class LivePortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "LIVE";

        public LivePortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            long? idInvitado = context.IdInvitado;

            if (!idInvitado.HasValue && !string.IsNullOrWhiteSpace(context.TokenConsulta))
            {
                idInvitado = await _context.ef_invitados
                    .AsNoTracking()
                    .Where(x =>
                        x.activo == true &&
                        x.rsvp_token == context.TokenConsulta)
                    .Select(x => (long?)x.id_invitado)
                    .FirstOrDefaultAsync();
            }

            var dinamicas = await _context.ef_evento_live_dinamicas
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == context.IdEvento &&
                    x.activo == true &&
                    x.visible_portal == true &&
                    (
                        x.estado == "ABIERTA" ||
                        x.estado == "CERRADA" ||
                        (x.estado == "FINALIZADA" && x.mostrar_resultados_publicos == true)
                    ))
                .OrderBy(x => x.fecha_desde)
                .ThenByDescending(x => x.fecha_alta)
                .Select(x => new
                {
                    x.id_dinamica,
                    x.codigo,
                    x.titulo,
                    x.descripcion,
                    x.tipo_dinamica,
                    x.estado,
                    x.fecha_desde,
                    x.fecha_hasta,
                    x.requiere_checkin,
                    x.max_respuestas_por_invitado,
                    x.permite_cambiar_respuesta,
                    x.mostrar_resultados_publicos,
                    x.modo_premio,
                    x.cantidad_ganadores,

                    opciones = _context.ef_evento_live_dinamica_opciones
                        .Where(o =>
                            o.id_dinamica == x.id_dinamica &&
                            o.activo == true)
                        .OrderBy(o => o.orden)
                        .Select(o => new
                        {
                            o.id_opcion,
                            o.texto,
                            o.descripcion,
                            o.imagen_url,
                            o.orden
                        })
                        .ToList(),

                    mi_respuesta = _context.ef_evento_live_respuestas
                        .Where(r =>
                            r.id_dinamica == x.id_dinamica &&
                            r.activo == true &&
                            (
                                (idInvitado.HasValue && r.id_invitado == idInvitado.Value) ||
                                (!string.IsNullOrWhiteSpace(context.TokenConsulta) &&
                                 r.token_consulta == context.TokenConsulta)
                            ))
                        .OrderByDescending(r => r.fecha_respuesta)
                        .Select(r => new
                        {
                            r.id_respuesta,
                            r.id_opcion,
                            r.respuesta_texto,
                            r.es_correcta,
                            r.orden_acierto,
                            r.fecha_respuesta
                        })
                        .FirstOrDefault(),

                    resultados = x.mostrar_resultados_publicos
                        ? _context.ef_evento_live_respuestas
                            .Where(r =>
                                r.id_dinamica == x.id_dinamica &&
                                r.activo == true &&
                                r.id_opcion != null)
                            .GroupBy(r => r.id_opcion)
                            .Select(g => new
                            {
                                id_opcion = g.Key,
                                votos = g.Count()
                            })
                            .ToList()
                        : null,

                    ganadores = _context.ef_evento_live_ganadores
                        .Where(g =>
                            g.id_dinamica == x.id_dinamica &&
                            (
                                (idInvitado.HasValue && g.id_invitado == idInvitado.Value) ||
                                (!string.IsNullOrWhiteSpace(context.TokenConsulta) &&
                                 g.token_consulta == context.TokenConsulta)
                            ))
                        .OrderBy(g => g.orden_ganador)
                        .Select(g => new
                        {
                            g.id_ganador,
                            g.orden_ganador,
                            g.estado,
                            g.fecha_ganador,
                            g.fecha_entrega
                        })
                        .ToList()
                })
                .ToListAsync();

            return new
            {
                id_evento = context.IdEvento,
                id_invitado = idInvitado,
                token_consulta = context.TokenConsulta,
                dinamicas
            };
        }
    }
}