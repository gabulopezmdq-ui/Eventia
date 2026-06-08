using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class QrsRetiroPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "QRS_RETIRO";

        public QrsRetiroPortalSectionProvider(DataContext context)
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
                    x.id_evento,
                    x.id_rsvp_grupo
                })
                .FirstOrDefaultAsync();

            if (inscripcion == null || inscripcion.id_rsvp_grupo == null)
                return new object[] { };

            var idsParticipantes = await (
                from gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                where gi.id_rsvp_grupo == inscripcion.id_rsvp_grupo
                select gi.id_invitado
            ).ToListAsync();

            var autorizaciones = await (
                from a in _context.ef_autorizaciones.AsNoTracking()
                join i in _context.ef_invitados.AsNoTracking()
                    on a.id_invitado_objetivo equals i.id_invitado
                where a.id_evento == inscripcion.id_evento
                   && idsParticipantes.Contains(a.id_invitado_objetivo)
                   && a.activo == true
                   && a.qr_token != null
                orderby i.apellido, i.nombre, a.nombre_autorizado
                select new
                {
                    a.id_autorizacion,
                    a.id_evento,
                    a.id_invitado_objetivo,
                    participante = (i.nombre + " " + i.apellido).Trim(),
                    a.tipo,
                    a.nombre_autorizado,
                    a.telefono_autorizado,
                    // relacion se omite porque tu entity no lo expone aunque exista en tabla
                    a.observaciones,
                    a.qr_token
                }
            ).ToListAsync();

            return autorizaciones;
        }
    }
}