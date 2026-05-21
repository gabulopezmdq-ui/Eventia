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
    [Route("eventos/{idEvento:long}/equipo")]
    public class evento_equipoController : ControllerBase
    {
        private readonly IEventoEquipoInternoService _service;

        public evento_equipoController(IEventoEquipoInternoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<EventoEquipoInternoDTO>>> Get(long idEvento, [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.GetAsync(idEvento, idUsuario, idIdioma));
        }

        [HttpPost]
        public async Task<ActionResult<EventoEquipoInternoDTO>> Post(long idEvento, [FromBody] AddEventoEquipoInternoRequest req, [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.AddAsync(idEvento, req, idUsuario, idIdioma));
        }

        [HttpPut("{idEventoUsuario:long}")]
        public async Task<IActionResult> Put(long idEvento, long idEventoUsuario, [FromBody] UpdateEventoEquipoInternoRequest req)
        {
            long idUsuario = User.GetUserId();
            await _service.SetActivoAsync(idEvento, idEventoUsuario, req, idUsuario);
            return Ok(new { ok = true });
        }

        [HttpDelete("{idEventoUsuario:long}")]
        public async Task<IActionResult> Delete(long idEvento, long idEventoUsuario)
        {
            long idUsuario = User.GetUserId();
            await _service.DeleteAsync(idEvento, idEventoUsuario, idUsuario);
            return Ok(new { ok = true });
        }
    }
}