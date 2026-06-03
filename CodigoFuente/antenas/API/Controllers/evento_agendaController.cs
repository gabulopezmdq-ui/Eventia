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
    public class evento_agendaController : ControllerBase
    {
        private readonly IEventoAgendaService _service;

        public evento_agendaController(IEventoAgendaService service)
        {
            _service = service;
        }

        [HttpGet("{idEvento}")]
        public async Task<ActionResult<List<EventoAgendaDTO>>> GetByEvento(
            long idEvento,
            [FromQuery] int idIdioma = 1,
            [FromQuery] bool soloActivas = true)
        {
            try
            {
                var result = await _service.GetByEventoAsync(idEvento, idIdioma, soloActivas);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{idEvento}/{idAgenda}")]
        public async Task<ActionResult<EventoAgendaDTO>> GetById(
            long idEvento,
            long idAgenda,
            [FromQuery] int idIdioma = 1)
        {
            try
            {
                var result = await _service.GetByIdAsync(idEvento, idAgenda, idIdioma);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{idEvento}")]
        public async Task<ActionResult<EventoAgendaDTO>> Crear(
            long idEvento,
            [FromBody] EventoAgendaRequestDTO dto)
        {
            try
            {
                var result = await _service.CrearAsync(idEvento, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{idEvento}/{idAgenda}")]
        public async Task<ActionResult<EventoAgendaDTO>> Modificar(
            long idEvento,
            long idAgenda,
            [FromBody] EventoAgendaRequestDTO dto)
        {
            try
            {
                var result = await _service.ModificarAsync(idEvento, idAgenda, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{idEvento}/{idAgenda}")]
        public async Task<ActionResult> Eliminar(long idEvento, long idAgenda)
        {
            try
            {
                await _service.EliminarAsync(idEvento, idAgenda);
                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}