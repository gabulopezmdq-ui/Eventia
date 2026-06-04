using API.DataSchema.DTO.Eventos.Checklist;
using API.Security;
using API.Services.Eventos.Checklist;
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
    public class evento_checklistController : ControllerBase
    {
        private readonly IEventoChecklistService _service;

        public evento_checklistController(IEventoChecklistService service)
        {
            _service = service;
        }

        [HttpGet("{idEvento}")]
        public async Task<ActionResult<List<EventoChecklistDTO>>> GetByEvento(
            long idEvento,
            [FromQuery] int idIdioma = 1,
            [FromQuery] bool soloActivas = true,
            [FromQuery] bool? completado = null)
        {
            try
            {
                var result = await _service.GetByEventoAsync(idEvento, idIdioma, soloActivas, completado);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{idEvento}/{idChecklist}")]
        public async Task<ActionResult<EventoChecklistDTO>> GetById(
            long idEvento,
            long idChecklist,
            [FromQuery] int idIdioma = 1)
        {
            try
            {
                var result = await _service.GetByIdAsync(idEvento, idChecklist, idIdioma);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{idEvento}")]
        public async Task<ActionResult<EventoChecklistDTO>> Crear(
            long idEvento,
            [FromBody] EventoChecklistRequestDTO dto)
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

        [HttpPut("{idEvento}/{idChecklist}")]
        public async Task<ActionResult<EventoChecklistDTO>> Modificar(
            long idEvento,
            long idChecklist,
            [FromBody] EventoChecklistRequestDTO dto)
        {
            try
            {
                long idUsuario = User.GetUserId();
                var result = await _service.ModificarAsync(idEvento, idChecklist, dto, idUsuario);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{idEvento}/{idChecklist}/completar")]
        public async Task<ActionResult<EventoChecklistDTO>> Completar(
            long idEvento,
            long idChecklist,
            [FromQuery] int idIdioma = 1)
        {
            try
            {
                long idUsuario = User.GetUserId();
                var result = await _service.SetCompletadoAsync(idEvento, idChecklist, true, idUsuario);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{idEvento}/{idChecklist}/reabrir")]
        public async Task<ActionResult<EventoChecklistDTO>> Reabrir(
            long idEvento,
            long idChecklist,
            [FromQuery] int idIdioma = 1)
        {
            try
            {
                long idUsuario = User.GetUserId();
                var result = await _service.SetCompletadoAsync(idEvento, idChecklist, false, idUsuario);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{idEvento}/{idChecklist}")]
        public async Task<ActionResult> Eliminar(long idEvento, long idChecklist)
        {
            try
            {
                await _service.EliminarAsync(idEvento, idChecklist);
                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}