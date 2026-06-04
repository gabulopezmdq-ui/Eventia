using API.DataSchema.DTO.Eventos.Novedades;
using API.Services.Eventos.Novedades;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("public/eventos")]
    public class public_evento_novedadesController : ControllerBase
    {
        private readonly IEventoNovedadesService _service;

        public public_evento_novedadesController(IEventoNovedadesService service)
        {
            _service = service;
        }

        [HttpGet("{token}/novedades")]
        public async Task<ActionResult<List<EventoNovedadDTO>>> GetPublicByToken(
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