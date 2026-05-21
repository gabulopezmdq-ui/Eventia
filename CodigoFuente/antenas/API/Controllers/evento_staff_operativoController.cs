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
    [Route("eventos/{idEvento:long}/staff-operativo")]
    public class evento_staff_operativoController : ControllerBase
    {
        private readonly IEventoStaffOperativoService _service;

        public evento_staff_operativoController(IEventoStaffOperativoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<EventoStaffOperativoDTO>>> Get(long idEvento, [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.GetAsync(idEvento, idUsuario, idIdioma));
        }

        [HttpPost]
        public async Task<ActionResult<EventoStaffOperativoDTO>> Post(long idEvento, [FromBody] AddEventoStaffOperativoRequest req, [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.AddAsync(idEvento, req, idUsuario, idIdioma));
        }

        [HttpPut("{idStaff:long}")]
        public async Task<IActionResult> Put(long idEvento, long idStaff, [FromBody] UpdateEventoStaffOperativoRequest req)
        {
            long idUsuario = User.GetUserId();
            await _service.SetActivoAsync(idEvento, idStaff, req, idUsuario);
            return Ok(new { ok = true });
        }

        [HttpDelete("{idStaff:long}")]
        public async Task<IActionResult> Delete(long idEvento, long idStaff)
        {
            long idUsuario = User.GetUserId();
            await _service.DeleteAsync(idEvento, idStaff, idUsuario);
            return Ok(new { ok = true });
        }
    }
}