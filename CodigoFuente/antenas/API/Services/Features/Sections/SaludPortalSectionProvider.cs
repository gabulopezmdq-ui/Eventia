using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class SaludPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "SALUD";

        public SaludPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            if (!desbloqueadoSensible)
                return null;

            if (!context.EsPrograma || !context.IdInscripcion.HasValue)
                return null;

            long idInscripcion = context.IdInscripcion.Value;

            var fichas = await (
                from f in _context.ef_programa_inscripcion_salud_fichas.AsNoTracking()
                join gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                    on f.id_rsvp_grupo_integrante equals gi.id_rsvp_grupo_integrante
                join i in _context.ef_invitados.AsNoTracking()
                    on gi.id_invitado equals i.id_invitado
                where f.id_inscripcion == idInscripcion
                   && f.activo == true
                   && i.activo == true
                orderby i.apellido, i.nombre
                select new
                {
                    f.id_salud_ficha,
                    f.id_inscripcion,
                    f.id_rsvp_grupo_integrante,
                    gi.id_invitado,
                    participante = (i.nombre + " " + i.apellido).Trim(),
                    f.tiene_problema_medico,
                    f.problema_medico_detalle,
                    f.tiene_alergias_no_alimentarias,
                    f.alergias_no_alimentarias_detalle,
                    f.necesidad_especial,
                    f.cobertura_medica,
                    f.observaciones_familia,
                    f.autoriza_emergencia_medica,
                    f.activo
                }
            ).ToListAsync();

            var idsFichas = fichas.Select(x => x.id_salud_ficha).ToList();

            var contactos = await _context.ef_programa_inscripcion_salud_contactos
                .AsNoTracking()
                .Where(x => idsFichas.Contains(x.id_salud_ficha))
                .OrderBy(x => x.orden)
                .Select(x => new
                {
                    x.id_contacto_emergencia,
                    x.id_salud_ficha,
                    x.nombre,
                    x.telefono,
                    x.relacion,
                    x.orden
                })
                .ToListAsync();

            var medicaciones = await _context.ef_programa_inscripcion_salud_medicaciones
                .AsNoTracking()
                .Where(x => idsFichas.Contains(x.id_salud_ficha))
                .OrderBy(x => x.id_medicacion)
                .Select(x => new
                {
                    x.id_medicacion,
                    x.id_salud_ficha,
                    x.nombre_medicacion,
                    x.dosis,
                    x.frecuencia,
                    x.horario,
                    x.indicaciones,
                    x.requiere_autorizacion
                })
                .ToListAsync();

            var restricciones = await (
                from pi in _context.ef_programa_inscripciones.AsNoTracking()
                join gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                    on pi.id_rsvp_grupo equals gi.id_rsvp_grupo
                join i in _context.ef_invitados.AsNoTracking()
                    on gi.id_invitado equals i.id_invitado
                join rr in _context.ef_rsvp_integrante_restricciones.AsNoTracking()
                    on gi.id_rsvp_grupo_integrante equals rr.id_rsvp_grupo_integrante
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
                where pi.id_inscripcion == idInscripcion
                   && i.activo == true
                orderby i.apellido, i.nombre, pr.codigo
                select new
                {
                    rr.id_rsvp_grupo_integrante,
                    gi.id_invitado,
                    participante = (i.nombre + " " + i.apellido).Trim(),
                    id_restriccion_alim = rr.id_restriccion_alim,
                    pr.codigo,
                    texto = tr != null ? tr.texto : pr.codigo,
                    rr.observaciones
                }
            ).ToListAsync();

            return new
            {
                fichas,
                contactos,
                medicaciones,
                restricciones
            };
        }
    }
}