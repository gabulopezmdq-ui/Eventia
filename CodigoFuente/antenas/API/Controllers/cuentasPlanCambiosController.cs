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
    [Route("cuentas/{id_cuenta}/plan-cambios")]
    [Authorize]
    public class cuentasPlanCambiosController : ControllerBase
    {
        private readonly ICuentaPlanCambiosService _service;

        public cuentasPlanCambiosController(ICuentaPlanCambiosService service)
        {
            _service = service;
        }

        // GET /cuentas/{id_cuenta}/plan-cambios/pendiente
        [HttpGet("pendiente")]
        public async Task<ActionResult> Pendiente(long id_cuenta)
        {
            long idUsuario = User.GetUserId();

            try
            {
                var result = await _service.GetPendienteCuentaAsync(id_cuenta, idUsuario);

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

        // POST /cuentas/{id_cuenta}/plan-cambios/solicitar
        [HttpPost("solicitar")]
        public async Task<ActionResult> Solicitar(long id_cuenta, [FromBody] SolicitarCambioPlanCuentaDTO req)
        {
            long idUsuario = User.GetUserId();

            try
            {
                var result = await _service.SolicitarCambioPlanAsync(id_cuenta, idUsuario, req);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}