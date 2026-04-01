using API.DataSchema.DTO;
using API.Services.Cuentas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SUPERADMIN")]
    [Route("admin/cuentas")]
    public class admin_cuentasController : ControllerBase
    {
        private readonly ILogger<admin_cuentasController> _logger;
        private readonly IAdminCuentasService _adminCuentasService;

        public admin_cuentasController(
            ILogger<admin_cuentasController> logger,
            IAdminCuentasService adminCuentasService)
        {
            _logger = logger;
            _adminCuentasService = adminCuentasService;
        }

        [HttpGet("GetPendientes")]
        public async Task<ActionResult<List<admin_cuenta_pendiente_dto>>> GetPendientes()
        {
            try
            {
                var result = await _adminCuentasService.GetPendientesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cuentas pendientes.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("Aprobar")]
        public async Task<ActionResult<admin_aprobar_cuenta_response>> Aprobar([FromBody] admin_aprobar_cuenta_request request)
        {
            try
            {
                long id_usuario_admin = Security.ClaimsExtensions.GetUserId(User);

                var result = await _adminCuentasService.AprobarAsync(request, id_usuario_admin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al aprobar cuenta.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("Suspender")]
        public async Task<ActionResult<admin_suspender_cuenta_response>> Suspender([FromBody] admin_suspender_cuenta_request request)
        {
            try
            {
                long id_usuario_admin = Security.ClaimsExtensions.GetUserId(User);

                var result = await _adminCuentasService.SuspenderAsync(request, id_usuario_admin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al suspender cuenta.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("CambiarPlan")]
        public async Task<ActionResult<admin_cambiar_plan_response>> CambiarPlan([FromBody] admin_cambiar_plan_request request)
        {
            try
            {
                long id_usuario_admin = Security.ClaimsExtensions.GetUserId(User);

                var result = await _adminCuentasService.CambiarPlanAsync(request, id_usuario_admin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cambiar plan de cuenta.");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

