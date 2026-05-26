using System;
using System.Linq;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO.Portal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Portal
{
    [ApiController]
    [Route("mi-eventia")]
    public class MiEventiaController : ControllerBase
    {
        private readonly DataContext _ctx;
        public MiEventiaController(DataContext ctx) => _ctx = ctx;

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

            var resp = new MiEventiaResponseDto
            {
                Persona = new PersonaDto
                {
                    IdPortalPersona = persona.IdPortalPersona,
                    Nombre = persona.Nombre,
                    Email = persona.Email,
                    Telefono = persona.Telefono
                },
                Items = accesos
            };

            return Ok(resp);
        }
    }
}
