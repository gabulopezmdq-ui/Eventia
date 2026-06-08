using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class RetirosPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "RETIROS";

        public RetirosPortalSectionProvider(DataContext context)
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

            var retiros = await (
                from r in _context.ef_retiros.AsNoTracking()
                join i in _context.ef_invitados.AsNoTracking()
                    on r.id_invitado_nino equals i.id_invitado
                where r.id_evento == inscripcion.id_evento
                   && idsParticipantes.Contains(r.id_invitado_nino)
                orderby r.fecha_operativa descending, r.fecha_retiro descending
                select new
                {
                    r.id_retiro,
                    r.id_evento,
                    r.id_invitado_nino,
                    participante = (i.nombre + " " + i.apellido).Trim(),
                    r.id_autorizacion,
                    r.nombre_retirador,
                    r.celular_retirador,
                    r.metodo_validacion,
                    r.observaciones,
                    r.fecha_operativa,
                    r.fecha_retiro,
                    r.id_usuario_operador
                }
            ).ToListAsync();

            return retiros;
        }
    }
}