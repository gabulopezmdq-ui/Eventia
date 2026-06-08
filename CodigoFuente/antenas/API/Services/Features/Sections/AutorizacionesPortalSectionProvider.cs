using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class AutorizacionesPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "AUTORIZACIONES";

        public AutorizacionesPortalSectionProvider(DataContext context)
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

            var inscripcion = await _context.ef_programa_inscripciones
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion && x.activo == true)
                .Select(x => new
                {
                    x.id_inscripcion,
                    responsable = (x.responsable_nombre + " " + x.responsable_apellido).Trim(),
                    email = x.responsable_email,
                    telefono = x.responsable_telefono
                })
                .FirstOrDefaultAsync();

            var autorizaciones = await (
                from a in _context.ef_programa_inscripcion_autorizaciones.AsNoTracking()
                join gi0 in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                    on a.id_rsvp_grupo_integrante equals gi0.id_rsvp_grupo_integrante into gjGi
                from gi in gjGi.DefaultIfEmpty()
                join i0 in _context.ef_invitados.AsNoTracking()
                    on gi.id_invitado equals i0.id_invitado into gjInv
                from i in gjInv.DefaultIfEmpty()
                where a.id_inscripcion == idInscripcion
                   && a.activo == true
                orderby a.id_rsvp_grupo_integrante, a.codigo
                select new
                {
                    a.id_inscripcion_autorizacion,
                    a.id_inscripcion,
                    a.id_rsvp_grupo_integrante,
                    participante = i != null ? (i.nombre + " " + i.apellido).Trim() : null,
                    a.id_programa_autorizacion_config,
                    a.codigo,
                    a.texto_aceptado,
                    a.aceptada,
                    a.fecha_aceptacion,
                    a.nombre_firmante,
                    a.ip_aceptacion
                }
            ).ToListAsync();

            return new
            {
                inscripcion,
                autorizaciones_grupo = autorizaciones
                    .Where(x => x.id_rsvp_grupo_integrante == null)
                    .ToList(),
                autorizaciones_participantes = autorizaciones
                    .Where(x => x.id_rsvp_grupo_integrante != null)
                    .ToList()
            };
        }
    }
}