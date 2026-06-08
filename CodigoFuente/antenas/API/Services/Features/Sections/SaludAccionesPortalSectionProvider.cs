using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class SaludAccionesPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "SALUD_ACCIONES";

        public SaludAccionesPortalSectionProvider(DataContext context)
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
                    x.id_rsvp_grupo,
                    responsable = (x.responsable_nombre + " " + x.responsable_apellido).Trim(),
                    x.responsable_email,
                    x.responsable_telefono
                })
                .FirstOrDefaultAsync();

            if (inscripcion == null || inscripcion.id_rsvp_grupo == null)
                return new object[] { };

            var idsParticipantes = await (
                from gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                where gi.id_rsvp_grupo == inscripcion.id_rsvp_grupo
                select gi.id_invitado
            ).ToListAsync();

            var acciones = await (
                from a in _context.ef_programa_salud_acciones.AsNoTracking()
                join i in _context.ef_invitados.AsNoTracking()
                    on a.id_participante equals i.id_invitado
                join tipo0 in _context.ef_param_programa_salud_tipos_accion.AsNoTracking()
                    on a.tipo_accion equals tipo0.codigo into gjTipo
                from tipo in gjTipo.DefaultIfEmpty()
                where a.id_evento == inscripcion.id_evento
                   && idsParticipantes.Contains(a.id_participante)
                   && a.activo == true
                orderby a.fecha_hora descending, a.id_accion_salud descending
                select new
                {
                    a.id_accion_salud,
                    a.id_evento,
                    a.id_participante,
                    participante = (i.nombre + " " + i.apellido).Trim(),
                    id_inscripcion = inscripcion.id_inscripcion,
                    responsable = inscripcion.responsable,
                    email_responsable = inscripcion.responsable_email,
                    telefono_responsable = inscripcion.responsable_telefono,
                    a.fecha_hora,
                    a.tipo_accion,
                    tipo_orden = tipo != null ? tipo.orden : 999,
                    a.descripcion,
                    a.requirio_contacto_familia,
                    a.contacto_realizado,
                    a.requiere_seguimiento,
                    a.usuario_registro,
                    a.activo
                }
            ).ToListAsync();

            return acciones;
        }
    }
}