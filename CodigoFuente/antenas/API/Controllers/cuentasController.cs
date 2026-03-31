using API.DataSchema.DTO;
using API.DataSchema.DTO.Cuentas;
using API.Services.Cuentas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class cuentasController : ControllerBase
    {
        private readonly ILogger<cuentasController> _logger;
        private readonly ICuentasService _cuentasService;

        public cuentasController(
            ILogger<cuentasController> logger,
            ICuentasService cuentasService)
        {
            _logger = logger;
            _cuentasService = cuentasService;
        }

        [HttpGet("MiCuenta")]
        public async Task<ActionResult<CuentaResponseDTO>> MiCuenta()
        {
            try
            {
                long id_usuario = Security.ClaimsExtensions.GetUserId(User);

                var result = await _cuentasService.GetMiCuentaAsync(id_usuario);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "No autorizado al obtener la cuenta del usuario.");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Error de negocio al obtener la cuenta del usuario.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al obtener la cuenta del usuario.");
                return StatusCode(500, new { message = "Ocurrió un error interno." });
            }
        }

        [HttpPut("UpdateMiCuenta")]
        public async Task<ActionResult<CuentaResponseDTO>> UpdateMiCuenta([FromBody] CuentaUpdateRequestDTO request)
        {
            try
            {
                long id_usuario = Security.ClaimsExtensions.GetUserId(User);

                var result = await _cuentasService.UpdateMiCuentaAsync(id_usuario, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "No autorizado al actualizar la cuenta del usuario.");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Error de negocio al actualizar la cuenta del usuario.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al actualizar la cuenta del usuario.");
                return StatusCode(500, new { message = "Ocurrió un error interno." });
            }
        }

        [HttpPost("SolicitarCuenta")]
        public async Task<ActionResult<cuenta_solicitar_response>> SolicitarCuenta([FromBody] cuenta_solicitar_request request)
        {
            try
            {
                long id_usuario = Security.ClaimsExtensions.GetUserId(User);

                var result = await _cuentasService.SolicitarCuentaAsync(id_usuario, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "No autorizado al solicitar cuenta.");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Error de negocio al solicitar cuenta.");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al solicitar cuenta.");
                return StatusCode(500, new { message = "Ocurrió un error interno." });
            }
        }
    }
}