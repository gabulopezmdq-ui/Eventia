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
    [Route("admin/eventos_planes")]
    public class admin_eventos_planesController : ControllerBase
    {
        private readonly IAdminEventoPlanCambiosService _service;

        public admin_eventos_planesController(IAdminEventoPlanCambiosService service)
        {
            _service = service;
        }

        // GET /admin/eventos_planes/pendientes
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

        // GET /admin/eventos_planes/{id_evento_plan_cambio}
        [HttpGet("{id_evento_plan_cambio:long}")]
        public async Task<ActionResult> GetById(long id_evento_plan_cambio)
        {
            try
            {
                var result = await _service.GetByIdAsync(id_evento_plan_cambio);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /admin/eventos_planes/aprobar
        [HttpPost("aprobar")]
        public async Task<ActionResult> Aprobar([FromBody] AdminAprobarCambioPlanDTO req)
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

        // POST /admin/eventos_planes/rechazar
        [HttpPost("rechazar")]
        public async Task<ActionResult> Rechazar([FromBody] AdminRechazarCambioPlanDTO req)
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