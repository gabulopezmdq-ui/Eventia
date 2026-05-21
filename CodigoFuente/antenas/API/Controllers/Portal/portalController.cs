using API.DataSchema;
using API.DataSchema.DTO.Portal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace API.Controllers.Portal
{
    [Route("api/portal")]
    [ApiController]
    public class portalController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;

        public portalController(DataContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpGet("{token}")]
        [AllowAnonymous]
        public async Task<ActionResult<PortalPublicoDTO>> GetPortal(string token)
        {
            var inscripcion = await _context.ef_programa_inscripciones
                .Include(i => i.evento)
                .FirstOrDefaultAsync(i => i.token_consulta == token && i.activo);

            if (inscripcion == null || inscripcion.evento == null)
            {
                return NotFound("Token inválido o expirado.");
            }

            var configs = await _context.ef_evento_portal_config
                .Include(c => c.portal_seccion)
                .Where(c => c.id_evento == inscripcion.id_evento && c.visible && c.activo)
                .OrderBy(c => c.orden)
                .ToListAsync();

            var dto = new PortalPublicoDTO
            {
                Evento = new PortalEventoDTO
                {
                    Nombre = inscripcion.evento.anfitriones_texto,
                    FechaInicio = inscripcion.evento.fecha_inicio?.ToString("yyyy-MM-dd") ?? "",
                    FechaFin = inscripcion.evento.fecha_fin?.ToString("yyyy-MM-dd") ?? "",
                    LogoUrl = null,
                    Estado = inscripcion.evento.estado
                },
                Participante = new PortalParticipanteDTO
                {
                    NombreResponsable = inscripcion.responsable_nombre,
                    ApellidoResponsable = inscripcion.responsable_apellido
                },
                SeccionesHabilitadas = configs.Select(c => new PortalSeccionDTO
                {
                    Codigo = c.portal_seccion?.codigo ?? "",
                    Orden = c.orden,
                    Titulo = !string.IsNullOrEmpty(c.titulo_override) ? c.titulo_override : (c.portal_seccion?.descripcion ?? "")
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost("{token}/verificar")]
        [AllowAnonymous]
        public async Task<ActionResult<PortalVerificarResponse>> Verificar(string token, [FromBody] PortalVerificarRequest req)
        {
            var inscripcion = await _context.ef_programa_inscripciones
                .FirstOrDefaultAsync(i => i.token_consulta == token && i.activo);

            if (inscripcion == null)
            {
                return NotFound("Token inválido.");
            }

            if (string.IsNullOrWhiteSpace(inscripcion.responsable_email))
            {
                return BadRequest("No hay un email registrado para esta inscripción.");
            }

            if (!string.Equals(inscripcion.responsable_email.Trim(), req.Email.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Email incorrecto.");
            }

            var jwtToken = GenerarJwtToken(inscripcion);

            return Ok(new PortalVerificarResponse { Token = jwtToken });
        }

        private string GenerarJwtToken(ef_programa_inscripciones inscripcion)
        {
            // Default key as fallback if not present
            var keyStr = _config.GetValue<string>("Jwt:Key") ?? "EventiaSuperSecretKey1234567890!";
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var issuer = _config.GetValue<string>("Jwt:Issuer") ?? "eventia";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, inscripcion.id_inscripcion.ToString()),
                new Claim("TokenConsulta", inscripcion.token_consulta ?? ""),
                new Claim("IdEvento", inscripcion.id_evento.ToString()),
                new Claim("Role", "PortalPadres")
            };

            var tokenDescriptor = new JwtSecurityToken(
                issuer,
                issuer,
                claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
