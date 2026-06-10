using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class ServiciosPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "SERVICIOS";

        public ServiciosPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            if (!context.EsPrograma || !context.IdInscripcion.HasValue)
                return null;

            long idInscripcion = context.IdInscripcion.Value;

            var inscripcion = await _context.ef_programa_inscripciones
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion && x.activo == true)
                .Select(x => new
                {
                    x.id_inscripcion,
                    x.id_evento,
                    x.id_rsvp_grupo,
                    x.id_invitado_responsable,
                    responsable = (x.responsable_nombre + " " + x.responsable_apellido).Trim(),
                    x.responsable_email,
                    x.responsable_telefono,
                    x.total_general,
                    x.moneda
                })
                .FirstOrDefaultAsync();

            if (inscripcion == null || inscripcion.id_rsvp_grupo == null)
                return null;

            var participantes = await (
                from gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                join i in _context.ef_invitados.AsNoTracking()
                    on gi.id_invitado equals i.id_invitado
                where gi.id_rsvp_grupo == inscripcion.id_rsvp_grupo
                   && i.activo == true
                   && gi.requiere_asistencia == true
                   && i.id_invitado != inscripcion.id_invitado_responsable
                orderby gi.orden, i.apellido, i.nombre
                select new
                {
                    gi.id_rsvp_grupo_integrante,
                    gi.id_invitado,
                    nombre_completo = (i.nombre + " " + i.apellido).Trim()
                }
            ).ToListAsync();

            var idsIntegrantes = participantes
                .Select(x => x.id_rsvp_grupo_integrante)
                .ToList();

            var periodos = await _context.ef_programa_inscripcion_periodos
                .AsNoTracking()
                .Where(x =>
                    x.id_inscripcion == idInscripcion &&
                    idsIntegrantes.Contains(x.id_rsvp_grupo_integrante) &&
                    x.activo == true)
                .OrderBy(x => x.fecha_desde)
                .ThenBy(x => x.id_programa_periodo)
                .Select(x => new
                {
                    x.id_inscripcion_periodo,
                    x.id_rsvp_grupo_integrante,
                    x.id_programa_periodo,
                    x.codigo,
                    x.nombre,
                    x.fecha_desde,
                    x.fecha_hasta,
                    x.precio_base,
                    x.moneda
                })
                .ToListAsync();

            var servicios = await _context.ef_programa_inscripcion_servicios
                .AsNoTracking()
                .Where(x =>
                    x.id_inscripcion == idInscripcion &&
                    idsIntegrantes.Contains(x.id_rsvp_grupo_integrante) &&
                    x.activo == true)
                .OrderBy(x => x.id_rsvp_grupo_integrante)
                .ThenBy(x => x.codigo)
                .Select(x => new
                {
                    x.id_inscripcion_servicio,
                    x.id_rsvp_grupo_integrante,
                    x.id_programa_servicio,
                    x.id_programa_periodo,
                    x.codigo,
                    x.nombre,
                    x.tipo_calculo,
                    x.precio,
                    x.moneda,
                    x.cantidad,
                    campos_extra_json = x.campos_extra_json == null ? null : x.campos_extra_json.ToString(),
                    x.subtotal
                })
                .ToListAsync();

            var idsServicios = servicios
                .Select(x => x.id_inscripcion_servicio)
                .ToList();

            var dias = await _context.ef_programa_inscripcion_servicio_dias
                .AsNoTracking()
                .Where(x =>
                    idsServicios.Contains(x.id_inscripcion_servicio) &&
                    x.activo == true)
                .OrderBy(x => x.fecha)
                .Select(x => new
                {
                    x.id_inscripcion_servicio,
                    x.fecha
                })
                .ToListAsync();

            var restricciones = await (
                from rr in _context.ef_rsvp_integrante_restricciones.AsNoTracking()
                join pr in _context.ef_param_restricciones_alimentarias.AsNoTracking()
                    on rr.id_restriccion_alim equals pr.id_restriccion_alim
                join tr0 in _context.ef_param_traducciones.AsNoTracking()
                    on new
                    {
                        entidad = "RESTRICCION_ALIMENTARIA",
                        id_item = (long)pr.id_restriccion_alim,
                        id_idioma = (short)idIdioma
                    }
                    equals new
                    {
                        entidad = tr0.entidad,
                        id_item = tr0.id_item,
                        id_idioma = tr0.id_idioma
                    }
                    into gjTr
                from tr in gjTr.DefaultIfEmpty()
                where idsIntegrantes.Contains(rr.id_rsvp_grupo_integrante)
                   && pr.activo == true
                orderby pr.orden, pr.codigo
                select new
                {
                    rr.id_rsvp_grupo_integrante,
                    id_restriccion_alim = pr.id_restriccion_alim,
                    pr.codigo,
                    texto = tr != null ? tr.texto : pr.codigo,
                    pr.categoria,
                    pr.requiere_alerta_visual,
                    pr.requiere_confirmacion_organizador,
                    pr.es_alergeno,
                    rr.observaciones
                }
            ).ToListAsync();

            var result = participantes.Select(p => new
            {
                id_invitado = p.id_invitado,
                id_rsvp_grupo_integrante = p.id_rsvp_grupo_integrante,
                participante = p.nombre_completo,

                periodos = periodos
                    .Where(per => per.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                    .Select(per => new
                    {
                        per.id_inscripcion_periodo,
                        per.id_programa_periodo,
                        per.codigo,
                        per.nombre,
                        per.fecha_desde,
                        per.fecha_hasta,
                        per.precio_base,
                        per.moneda
                    })
                    .ToList(),

                servicios = servicios
                    .Where(s => s.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                    .Select(s =>
                    {
                        var fechas = dias
                            .Where(d => d.id_inscripcion_servicio == s.id_inscripcion_servicio)
                            .Select(d => d.fecha)
                            .ToList();

                        int cantidadCalculada;

                        if (s.tipo_calculo == "POR_DIA")
                            cantidadCalculada = fechas.Count;
                        else if (s.cantidad.HasValue)
                            cantidadCalculada = s.cantidad.Value;
                        else
                            cantidadCalculada = 1;

                        return new
                        {
                            s.id_inscripcion_servicio,
                            s.id_programa_servicio,
                            s.id_programa_periodo,
                            s.codigo,
                            s.nombre,
                            tipo_calculo = s.tipo_calculo,
                            s.precio,
                            s.moneda,
                            s.cantidad,
                            cantidad_calculada = cantidadCalculada,
                            fechas,
                            s.campos_extra_json,
                            s.subtotal
                        };
                    })
                    .ToList(),

                restricciones_alimentarias = restricciones
                    .Where(r => r.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                    .Select(r => new
                    {
                        r.id_restriccion_alim,
                        r.codigo,
                        r.texto,
                        r.categoria,
                        r.requiere_alerta_visual,
                        r.requiere_confirmacion_organizador,
                        r.es_alergeno,
                        r.observaciones
                    })
                    .ToList()
            }).ToList();

            return new
            {
                inscripcion = new
                {
                    inscripcion.id_inscripcion,
                    inscripcion.id_evento,
                    inscripcion.responsable,
                    inscripcion.responsable_email,
                    inscripcion.responsable_telefono,
                    inscripcion.total_general,
                    inscripcion.moneda
                },
                participantes = result
            };
        }
    }
}