using API.DataSchema;
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
        private readonly DataContext _context;
        private readonly ILogger<cuentasController> _logger;
        private readonly ICuentasService _cuentasService;

        public cuentasController(
            DataContext context,
            ILogger<cuentasController> logger,
            ICuentasService cuentasService)
        {
            _context = context;
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la cuenta del usuario.");
                return BadRequest(ex.Message);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la cuenta del usuario.");
                return BadRequest(ex.Message);
            }
        }
    }
}