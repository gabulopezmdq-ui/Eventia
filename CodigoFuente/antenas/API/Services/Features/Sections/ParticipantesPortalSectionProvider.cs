using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class ParticipantesPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "PARTICIPANTES";

        public ParticipantesPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            if (context.EsPrograma && context.IdInscripcion.HasValue)
            {
                var inscripcion = await _context.ef_programa_inscripciones
                    .AsNoTracking()
                    .Where(x => x.id_inscripcion == context.IdInscripcion.Value && x.activo == true)
                    .Select(x => new
                    {
                        x.id_inscripcion,
                        x.id_evento,
                        x.id_rsvp_grupo,
                        x.id_invitado_responsable,
                        responsable = new
                        {
                            nombre = x.responsable_nombre,
                            apellido = x.responsable_apellido,
                            email = x.responsable_email,
                            telefono = x.responsable_telefono,
                            documento = x.responsable_documento,
                            relacion = x.responsable_relacion
                        }
                    })
                    .FirstOrDefaultAsync();

                if (inscripcion == null || inscripcion.id_rsvp_grupo == null)
                    return new { inscripcion, participantes = new object[] { } };

                var participantes = await (
                    from gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                    join i in _context.ef_invitados.AsNoTracking()
                        on gi.id_invitado equals i.id_invitado
                    join p0 in _context.ef_invitados_perfiles.AsNoTracking()
                        on i.id_invitado equals p0.id_invitado into gjPerfil
                    from p in gjPerfil.DefaultIfEmpty()
                    where gi.id_rsvp_grupo == inscripcion.id_rsvp_grupo
                       && i.activo == true
                       && gi.requiere_asistencia == true
                       && i.id_invitado != inscripcion.id_invitado_responsable
                    orderby gi.orden, i.apellido, i.nombre
                    select new
                    {
                        gi.id_rsvp_grupo_integrante,
                        gi.id_rsvp_grupo,
                        gi.rol,
                        es_titular = gi.rol == "T",
                        gi.orden,
                        gi.id_evento_edad_rango,
                        gi.edad_anios,
                        gi.requiere_asistencia,
                        gi.alimentacion_detalle,
                        gi.rol_evento,
                        gi.asiste,
                        gi.fecha_respuesta,
                        gi.modalidad_retiro,

                        i.id_invitado,
                        i.id_evento,
                        i.id_acceso,
                        i.nombre,
                        i.apellido,
                        i.email,
                        i.celular,
                        i.rsvp_estado,
                        i.qr_token,

                        fecha_nacimiento = p != null ? p.fecha_nacimiento : null
                    }
                ).ToListAsync();

                return new
                {
                    inscripcion,
                    participantes
                };
            }

            if (context.EsEvento && context.IdRsvpGrupo.HasValue)
            {
                var participantes = await (
                    from gi in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                    join i in _context.ef_invitados.AsNoTracking()
                        on gi.id_invitado equals i.id_invitado
                    join p0 in _context.ef_invitados_perfiles.AsNoTracking()
                        on i.id_invitado equals p0.id_invitado into gjPerfil
                    from p in gjPerfil.DefaultIfEmpty()
                    where gi.id_rsvp_grupo == context.IdRsvpGrupo.Value
                       && i.activo == true
                    orderby gi.rol == "T" ? 0 : 1, gi.orden, i.apellido, i.nombre
                    select new
                    {
                        gi.id_rsvp_grupo_integrante,
                        gi.id_rsvp_grupo,
                        gi.rol,
                        es_titular = gi.rol == "T",
                        gi.orden,
                        gi.id_evento_edad_rango,
                        gi.edad_anios,
                        gi.requiere_asistencia,
                        gi.alimentacion_detalle,
                        gi.rol_evento,
                        gi.asiste,
                        gi.fecha_respuesta,
                        gi.modalidad_retiro,

                        i.id_invitado,
                        i.id_evento,
                        i.id_acceso,
                        i.nombre,
                        i.apellido,
                        i.email,
                        i.celular,
                        i.rsvp_estado,
                        i.qr_token,

                        fecha_nacimiento = p != null ? p.fecha_nacimiento : null
                    }
                ).ToListAsync();

                return participantes;
            }

            if (context.EsEvento && context.IdInvitado.HasValue)
            {
                return await (
                    from i in _context.ef_invitados.AsNoTracking()
                    join p0 in _context.ef_invitados_perfiles.AsNoTracking()
                        on i.id_invitado equals p0.id_invitado into gjPerfil
                    from p in gjPerfil.DefaultIfEmpty()
                    where i.id_invitado == context.IdInvitado.Value
                       && i.activo == true
                    select new
                    {
                        i.id_invitado,
                        i.id_evento,
                        i.id_acceso,
                        i.id_rsvp_grupo,
                        i.nombre,
                        i.apellido,
                        i.email,
                        i.celular,
                        i.rsvp_estado,
                        i.qr_token,
                        fecha_nacimiento = p != null ? p.fecha_nacimiento : null
                    }
                ).ToListAsync();
            }

            return new object[] { };
        }
    }
}
