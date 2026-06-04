using API.DataSchema.DTO.Eventos.Historial;
using API.Services.Eventos.Historial;
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
    public class evento_historialController : ControllerBase
    {
        private readonly IEventoHistorialService _service;

        public evento_historialController(IEventoHistorialService service)
        {
            _service = service;
        }

        [HttpGet("{idEvento}")]
        public async Task<ActionResult<List<EventoHistorialDTO>>> GetByEvento(
            long idEvento,
            [FromQuery] string? modulo = null,
            [FromQuery] int take = 100)
        {
            try
            {
                var result = await _service.GetByEventoAsync(idEvento, modulo, take);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}