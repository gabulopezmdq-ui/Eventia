using API.DataSchema.DTO.Eventos;
using API.Security;
using API.Services.Eventos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("eventos/{idEvento:long}/staff")]
    public class evento_staffController : ControllerBase
    {
        private readonly IEventoStaffAsignacionService _service;

        public evento_staffController(IEventoStaffAsignacionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<EventoStaffAsignadoDTO>>> Get(long idEvento, [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.GetAsync(idEvento, idUsuario, idIdioma));
        }

        [HttpPost("desde-cuenta")]
        public async Task<ActionResult<EventoStaffAsignadoDTO>> PostDesdeCuenta(long idEvento, [FromBody] AddEventoStaffDesdeCuentaRequest req, [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.AddDesdeCuentaAsync(idEvento, req, idUsuario, idIdioma));
        }

        [HttpPost("nuevo")]
        public async Task<ActionResult<EventoStaffAsignadoDTO>> PostNuevo(long idEvento, [FromBody] AddEventoStaffNuevoRequest req, [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.AddNuevoAsync(idEvento, req, idUsuario, idIdioma));
        }

        [HttpPut("{idEventoStaff:long}")]
        public async Task<IActionResult> Put(long idEvento, long idEventoStaff, [FromBody] UpdateEventoStaffAsignadoRequest req)
        {
            long idUsuario = User.GetUserId();
            await _service.SetActivoAsync(idEvento, idEventoStaff, req, idUsuario);
            return Ok(new { ok = true });
        }

        [HttpDelete("{idEventoStaff:long}")]
        public async Task<IActionResult> Delete(long idEvento, long idEventoStaff)
        {
            long idUsuario = User.GetUserId();
            await _service.DeleteAsync(idEvento, idEventoStaff, idUsuario);
            return Ok(new { ok = true });
        }
    }
}