using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using API.DataSchema;
using API.DataSchema.DTO.Portal;

namespace API.Services.Portal
{
    public class PortalService
    {
        private readonly DataContext _context;
        private readonly PortalSeguridadService _portalSeguridadService;

        public PortalService(DataContext context, PortalSeguridadService portalSeguridadService)
        {
            _context = context;
            _portalSeguridadService = portalSeguridadService;
        }

        public async Task<PortalPuntualResponseDto?> GetPortalAsync(string token, int idIdioma = 1)
        {
            var inscripcion = await _context.ef_programa_inscripciones
                .Include(i => i.evento)
                .FirstOrDefaultAsync(i => i.token_consulta == token && i.activo);

            var invitado = inscripcion == null ? await _context.ef_invitados
                .Include(i => i.evento)
                .FirstOrDefaultAsync(i => i.rsvp_token == token && i.activo) : null;

            if (inscripcion == null && invitado == null)
            {
                return null;
            }

            var esPrograma = inscripcion != null;
            var evento = esPrograma ? inscripcion.evento : invitado.evento;
            var idEvento = esPrograma ? inscripcion.id_evento : invitado.id_evento;

            var usuarioNombre = esPrograma
                ? $"{inscripcion.responsable_nombre} {inscripcion.responsable_apellido}".Trim()
                : $"{invitado.nombre} {invitado.apellido}".Trim();

            var usuarioEmail = esPrograma ? inscripcion.responsable_email : invitado.email;

            var desbloqueado = await _portalSeguridadService.EstaDesbloqueadoAsync(token);

            var acceso = await _context.PortalAccesos
                .FirstOrDefaultAsync(a => a.TokenConsulta == token && a.Activo);

            string? urlMiEventia = null;
            if (acceso != null)
            {
                var persona = await _context.PortalPersonas.FirstOrDefaultAsync(p => p.IdPortalPersona == acceso.IdPortalPersona);
                if (persona != null)
                {
                    urlMiEventia = $"/mi-eventia/{persona.TokenPortal}";
                }
            }

            var secciones = await _portalSeguridadService.GetSeccionesPortalAsync(idEvento, esPrograma ? "PROGRAMA" : "EVENTO", idIdioma);

            bool requiereDesbloqueoSensible = secciones.Any(s => s.requiere_desbloqueo);

            return new PortalPuntualResponseDto
            {
                TipoPortal = esPrograma ? "PROGRAMA" : "EVENTO",
                IdEvento = idEvento,
                Evento = new PortalPuntualEventoDto
                {
                    Titulo = evento?.anfitriones_texto ?? "",
                    FechaInicio = evento?.fecha_inicio?.ToString("yyyy-MM-dd") ?? "",
                    FechaFin = evento?.fecha_fin?.ToString("yyyy-MM-dd") ?? ""
                },
                Usuario = new PortalPuntualUsuarioDto
                {
                    Nombre = usuarioNombre,
                    Email = usuarioEmail
                },
                RequiereDesbloqueoSensible = requiereDesbloqueoSensible,
                DesbloqueadoSensible = desbloqueado,
                UrlMiEventia = urlMiEventia,
                Secciones = secciones,
                Data = new PortalPuntualDataDto
                {
                    Resumen = new { },
                    Pagos = esPrograma ? new { } : null,
                    Salud = (secciones.Any(s => s.codigo == "SALUD") && !desbloqueado) ? null : new object[] { },
                    QrsRetiro = (secciones.Any(s => s.codigo == "QRS_RETIRO") && !desbloqueado) ? null : new object[] { },
                    Fotos = (secciones.Any(s => s.codigo == "FOTOS") && !desbloqueado) ? null : new object[] { },
                    Autorizaciones = (secciones.Any(s => s.codigo == "AUTORIZACIONES") && !desbloqueado) ? null : new object[] { }
                }
            };
        }
    }
}
