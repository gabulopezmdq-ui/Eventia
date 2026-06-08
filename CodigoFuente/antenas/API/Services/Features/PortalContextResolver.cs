using System;
using System.Linq;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;

namespace API.Services.Features
{
    public class PortalContextResolver
    {
        private readonly DataContext _context;

        public PortalContextResolver(DataContext context)
        {
            _context = context;
        }

        public async Task<PortalContextDTO?> ResolveAsync(string tokenConsulta)
        {
            if (string.IsNullOrWhiteSpace(tokenConsulta))
                return null;

            tokenConsulta = tokenConsulta.Trim();

            var inscripcion = await _context.ef_programa_inscripciones
                .AsNoTracking()
                .Where(x => x.token_consulta == tokenConsulta && x.activo == true)
                .Select(x => new PortalContextDTO
                {
                    TokenConsulta = tokenConsulta,
                    TipoPortal = "PROGRAMA",
                    IdEvento = x.id_evento,
                    IdInscripcion = x.id_inscripcion,
                    UsuarioNombre = (x.responsable_nombre + " " + x.responsable_apellido).Trim(),
                    UsuarioEmail = x.responsable_email
                })
                .FirstOrDefaultAsync();

            if (inscripcion != null)
                return inscripcion;

            var invitado = await _context.ef_invitados
                .AsNoTracking()
                .Where(x => x.rsvp_token == tokenConsulta && x.activo == true)
                .Select(x => new PortalContextDTO
                {
                    TokenConsulta = tokenConsulta,
                    TipoPortal = "EVENTO",
                    IdEvento = x.id_evento,
                    IdInvitado = x.id_invitado,
                    IdAcceso = x.id_acceso,
                    IdRsvpGrupo = x.id_rsvp_grupo,
                    UsuarioNombre = (x.nombre + " " + x.apellido).Trim(),
                    UsuarioEmail = x.email
                })
                .FirstOrDefaultAsync();

            if (invitado != null)
                return invitado;

            return null;
        }
    }
}