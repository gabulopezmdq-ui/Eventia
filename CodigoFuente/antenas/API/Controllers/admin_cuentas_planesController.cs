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
    [Authorize(Roles = "SUPERADMIN")]
    [Route("admin/cuentas_planes")]
    public class admin_cuentas_planesController : ControllerBase
    {
        private readonly IAdminCuentaPlanCambiosService _service;

        public admin_cuentas_planesController(IAdminCuentaPlanCambiosService service)
        {
            _service = service;
        }

        // GET /admin/cuentas_planes/pendientes
        [HttpGet("pendientes")]
        public async Task<ActionResult> Pendientes()
        {
            try
            {
                var result = await _service.GetPendientesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /admin/cuentas_planes/{id_cuenta_plan_cambio}
        [HttpGet("{id_cuenta_plan_cambio:long}")]
        public async Task<ActionResult> GetById(long id_cuenta_plan_cambio)
        {
            try
            {
                var result = await _service.GetByIdAsync(id_cuenta_plan_cambio);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /admin/cuentas_planes/aprobar
        [HttpPost("aprobar")]
        public async Task<ActionResult> Aprobar([FromBody] AdminAprobarCambioPlanCuentaDTO req)
        {
            long idAdmin = User.GetUserId();

            try
            {
                var ok = await _service.AprobarAsync(req, idAdmin);
                return Ok(new { ok });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /admin/cuentas_planes/rechazar
        [HttpPost("rechazar")]
        public async Task<ActionResult> Rechazar([FromBody] AdminRechazarCambioPlanCuentaDTO req)
        {
            long idAdmin = User.GetUserId();

            try
            {
                var ok = await _service.RechazarAsync(req, idAdmin);
                return Ok(new { ok });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}