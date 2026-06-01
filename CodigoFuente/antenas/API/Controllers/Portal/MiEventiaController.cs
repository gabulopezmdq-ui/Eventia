using System;
using System.Linq;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO.Portal;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Portal
{
    [ApiController]
    [Route("mi-eventia")]
    public class MiEventiaController : ControllerBase
    {
        private readonly DataContext _ctx;
        private readonly MiEventiaService _service;
        public MiEventiaController(DataContext ctx, MiEventiaService service)
        {
            _ctx = ctx;
            _service = service;
        }

        [HttpGet("{tokenPortal:guid}")]
        [ApiExplorerSettings(GroupName = "Mi-Eventia")]
        [ProducesResponseType(typeof(MiEventiaResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Get(string tokenPortal)
        {
            if (!Guid.TryParse(tokenPortal, out Guid guidToken))
            {
                return BadRequest("Token inválido.");
            }

            var persona = await _ctx.PortalPersonas
                .FirstOrDefaultAsync(p => p.TokenPortal == guidToken && p.Activo);

            if (persona == null) return NotFound();

            var accesos = await _ctx.PortalAccesos
                .Where(a => a.IdPortalPersona == persona.IdPortalPersona && a.Activo)
                .OrderBy(a => a.FechaAlta)
                .Select(a => new AccesoItemDto
                {
                    Tipo = a.Tipo.ToString(),
                    IdEvento = a.IdEvento,
                    IdInscripcion = a.IdInscripcion,
                    IdInvitado = a.IdInvitado,
                    TokenConsulta = a.TokenConsulta,
                    Titulo = a.TituloOverride,
                    Estado = a.Activo ? "ACTIVO" : "INACTIVO",
                    UrlPortal = $"/portal/{a.TokenConsulta}"
                })
                .ToListAsync();

            var resp = new
            {
                persona = new
                {
                    id_portal_persona = persona.IdPortalPersona,
                    nombre = persona.Nombre,
                    email = persona.Email,
                    telefono = persona.Telefono
                },
                items = accesos.Select(a => new
                {
                    tipo = a.Tipo,
                    id_evento = a.IdEvento,
                    id_inscripcion = a.IdInscripcion,
                    id_invitado = a.IdInvitado,
                    token_consulta = a.TokenConsulta,
                    titulo = a.Titulo,
                    estado = a.Estado,
                    url_portal = a.UrlPortal
                })
            };

            return Ok(resp);
        }

        [HttpPost("recuperar")]
        public async Task<IActionResult> Recuperar([FromBody] RecuperarMiEventiaRequestDTO req)
        {
            var result = await _service.RecuperarAccesoAsync(req);
            return Ok(result);
        }

        [HttpPost("validar-recuperacion")]
        public async Task<IActionResult> ValidarRecuperacion([FromBody] ValidarRecuperacionRequestDTO req)
        {
            var result = await _service.ValidarRecuperacionAsync(req);
            return Ok(result);
        }
    }
}
