using API.DataSchema.DTO;
using API.Services.Eventos.Agenda;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class tipos_agenda_eventoController : ControllerBase
    {
        private readonly ITiposAgendaEventoService _service;

        public tipos_agenda_eventoController(ITiposAgendaEventoService service)
        {
            _service = service;
        }

        [HttpGet("combo")]
        public async Task<ActionResult<List<TipoAgendaEventoComboDTO>>> Combo([FromQuery] int idIdioma = 1)
        {
            try
            {
                var result = await _service.ComboAsync(idIdioma);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}