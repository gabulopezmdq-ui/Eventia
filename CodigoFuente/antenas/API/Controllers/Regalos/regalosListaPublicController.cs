using API.DataSchema.DTO.Regalos;
using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers.Regalos
{
    [ApiController]
    [Route("public/regalos/lista")]
    [AllowAnonymous]
    public class regalosListaPublicController : ControllerBase
    {
        private readonly IRegalosListaService _service;

        public regalosListaPublicController(IRegalosListaService service)
        {
            _service = service;
        }

        [HttpPost("reservar")]
        public async Task<ActionResult> Reservar([FromBody] RegalosListaReservarDTO req)
        {
            try
            {
                var dto = await _service.ReservarAsync(req);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id_evento}/reservas/{id_reserva}/cancelar")]
        public async Task<ActionResult> Cancelar(long id_evento, long id_reserva)
        {
            var ok = await _service.CancelarReservaAsync(id_evento, id_reserva);
            if (!ok) return NotFound(new { error = "Reserva no encontrada." });

            return Ok(new { ok = true });
        }
    }
}