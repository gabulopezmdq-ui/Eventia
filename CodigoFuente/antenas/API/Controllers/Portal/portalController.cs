using API.DataSchema;
using API.DataSchema.DTO.Portal;
using API.Services.Portal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers.Portal
{
    [Route("api/portal")]
    [ApiController]
    public class portalController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly PortalSeguridadService _portalSeguridadService;

        public portalController(DataContext context, PortalSeguridadService portalSeguridadService)
        {
            _context = context;
            _portalSeguridadService = portalSeguridadService;
        }

        [HttpGet("{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPortal(string token, [FromQuery] int idIdioma = 1)
        {
            var inscripcion = await _context.ef_programa_inscripciones
                .Include(i => i.evento)
                .FirstOrDefaultAsync(i => i.token_consulta == token && i.activo);

            var invitado = inscripcion == null ? await _context.ef_invitados
                .Include(i => i.evento)
                .FirstOrDefaultAsync(i => i.rsvp_token == token && i.activo) : null;

            if (inscripcion == null && invitado == null)
            {
                return NotFound("Token inválido o expirado.");
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

            string urlMiEventia = null;
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

            var resp = new
            {
                tipoPortal = esPrograma ? "PROGRAMA" : "EVENTO",
                idEvento = idEvento,
                evento = new
                {
                    titulo = evento?.anfitriones_texto ?? "",
                    fechaInicio = evento?.fecha_inicio?.ToString("yyyy-MM-dd") ?? "",
                    fechaFin = evento?.fecha_fin?.ToString("yyyy-MM-dd") ?? ""
                },
                usuario = new
                {
                    nombre = usuarioNombre,
                    email = usuarioEmail
                },
                requiere_desbloqueo_sensible = requiereDesbloqueoSensible,
                desbloqueado_sensible = desbloqueado,
                url_mi_eventia = urlMiEventia,
                secciones = secciones,
                data = new
                {
                    resumen = new { },
                    pagos = esPrograma ? new { } : null,
                    salud = (secciones.Any(s => s.codigo == "SALUD") && !desbloqueado) ? null : new object[] { },
                    qrsRetiro = (secciones.Any(s => s.codigo == "QRS_RETIRO") && !desbloqueado) ? null : new object[] { },
                    fotos = (secciones.Any(s => s.codigo == "FOTOS") && !desbloqueado) ? null : new object[] { },
                    autorizaciones = (secciones.Any(s => s.codigo == "AUTORIZACIONES") && !desbloqueado) ? null : new object[] { }
                }
            };

            return Ok(resp);
        }
    }
}
