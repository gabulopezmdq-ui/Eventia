using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SUPERADMIN")]
    [Route("admin/eventos")]
    public class adminEventosController : ControllerBase
    {
        private readonly IEventosService _eventos;

        public adminEventosController(IEventosService eventos)
        {
            _eventos = eventos;
        }

        // GET /admin/eventos?estado=B
        [HttpGet]
        public async Task<ActionResult<List<EventoResponse>>> Listar([FromQuery] string? estado = null)
        {
            var result = await _eventos.AdminListarEventosAsync(estado);
            return Ok(result);
        }

        // GET /admin/eventos/123
        [HttpGet("{idEvento:long}")]
        public async Task<ActionResult<EventoResponse>> Get(long idEvento)
        {
            var ev = await _eventos.AdminGetEventoAsync(idEvento);
            return Ok(ev);
        }

        // POST /admin/eventos/123/activar
        [HttpPost("{idEvento:long}/activar")]
        public async Task<IActionResult> Activar(long idEvento)
        {
            await _eventos.ActivarEventoAdminAsync(idEvento);
            return Ok(new { message = "Evento activado." });
        }
    }
}
