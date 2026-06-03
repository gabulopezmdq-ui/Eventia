using API.DataSchema.DTO;
using API.Security;
using API.Services;
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
    public class evento_novedadesController : ControllerBase
    {
        private readonly IEventoNovedadesService _service;

        public evento_novedadesController(IEventoNovedadesService service)
        {
            _service = service;
        }

        [HttpGet("{idEvento}")]
        public async Task<ActionResult<List<EventoNovedadDTO>>> GetByEvento(
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

        [HttpGet("{idEvento}/{idNovedad}")]
        public async Task<ActionResult<EventoNovedadDTO>> GetById(
            long idEvento,
            long idNovedad,
            [FromQuery] int idIdioma = 1)
        {
            try
            {
                var result = await _service.GetByIdAsync(idEvento, idNovedad, idIdioma);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{idEvento}")]
        public async Task<ActionResult<EventoNovedadDTO>> Crear(long idEvento, [FromBody] EventoNovedadRequestDTO dto)
        {
            try
            {
                long idUsuario = User.GetUserId();
                var result = await _service.CrearAsync(idEvento, dto, idUsuario);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{idEvento}/{idNovedad}")]
        public async Task<ActionResult<EventoNovedadDTO>> Modificar(
            long idEvento,
            long idNovedad,
            [FromBody] EventoNovedadRequestDTO dto)
        {
            try
            {
                var result = await _service.ModificarAsync(idEvento, idNovedad, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{idEvento}/{idNovedad}")]
        public async Task<ActionResult> Eliminar(long idEvento, long idNovedad)
        {
            try
            {
                await _service.EliminarAsync(idEvento, idNovedad);
                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}