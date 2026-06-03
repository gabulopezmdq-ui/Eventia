using API.DataSchema.DTO.Eventos.Agenda;
using API.Services.Eventos.Agenda;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("public/eventos")]
    public class public_evento_agendaController : ControllerBase
    {
        private readonly IEventoAgendaService _service;

        public public_evento_agendaController(IEventoAgendaService service)
        {
            _service = service;
        }

        [HttpGet("{token}/agenda")]
        public async Task<ActionResult<List<EventoAgendaDTO>>> GetPublicByToken(
            string token,
            [FromQuery] int idIdioma = 1)
        {
            try
            {
                var result = await _service.GetPublicByTokenAsync(token, idIdioma);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}