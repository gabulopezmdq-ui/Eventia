using API.DataSchema.DTO.Planes;
using API.Security;
using API.Services.Planes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("eventos/{id_evento}/plan-cambios")]
    [Authorize]
    public class eventosPlanCambiosController : ControllerBase
    {
        private readonly IEventoPlanCambiosService _service;

        public eventosPlanCambiosController(IEventoPlanCambiosService service)
        {
            _service = service;
        }

        // GET /eventos/{id_evento}/plan-cambios/pendiente
        [HttpGet("pendiente")]
        public async Task<ActionResult> Pendiente(long id_evento)
        {
            long idUsuario = User.GetUserId();

            try
            {
                var result = await _service.GetPendienteEventoAsync(id_evento, idUsuario);

                if (result == null)
                    return Ok(new { tiene_pendiente = false });

                return Ok(new
                {
                    tiene_pendiente = true,
                    solicitud = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /eventos/{id_evento}/plan-cambios/solicitar
        [HttpPost("solicitar")]
        public async Task<ActionResult> Solicitar(long id_evento, [FromBody] SolicitarCambioPlanDTO req)
        {
            long idUsuario = User.GetUserId();

            try
            {
                var result = await _service.SolicitarCambioPlanAsync(id_evento, idUsuario, req);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}