using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class hospedajesController : ControllerBase
    {
        private readonly IEventoHospedajesService _svc;

        public hospedajesController(IEventoHospedajesService svc)
        {
            _svc = svc;
        }

        // ============================
        // ADMIN (requiere token)
        // ============================

        [Authorize]
        [HttpGet("{idEvento:long}/admin")]
        public async Task<ActionResult<HospedajesAdminGetResponseDTO>> GetAdmin(long idEvento)
        {
            long idUsuario = User.GetUserId();
            var result = await _svc.GetAdminAsync(idUsuario, idEvento);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("{idEvento:long}/config")]
        public async Task<IActionResult> SetConfig(long idEvento, [FromBody] HospedajesConfigDTO config)
        {
            long idUsuario = User.GetUserId();
            await _svc.SetConfigAsync(idUsuario, idEvento, config);
            return Ok(new { ok = true });
        }

        [Authorize]
        [HttpPost("{idEvento:long}/upsert")]
        public async Task<IActionResult> Upsert(long idEvento, [FromBody] HospedajeUpsertRequestDTO req)
        {
            long idUsuario = User.GetUserId();
            var id = await _svc.UpsertAsync(idUsuario, idEvento, req);
            return Ok(new { ok = true, id_hospedaje = id });
        }

        [Authorize]
        [HttpDelete("{idEvento:long}/{idHospedaje:long}")]
        public async Task<IActionResult> Delete(long idEvento, long idHospedaje)
        {
            long idUsuario = User.GetUserId();
            var ok = await _svc.DeleteAsync(idUsuario, idEvento, idHospedaje);
            return Ok(new { ok });
        }

        // ============================
        // PUBLIC (sin token)
        // ============================

        [AllowAnonymous]
        [HttpGet("{idEvento:long}/public")]
        public async Task<ActionResult<HospedajesPublicGetResponseDTO>> GetPublic(long idEvento, [FromQuery] string? rsvp_token = null)
        {
            var result = await _svc.GetPublicAsync(idEvento, rsvp_token);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("{idEvento:long}/public/guia.pdf")]
        public async Task<IActionResult> GuiaPdf(long idEvento, [FromQuery] string? rsvp_token = null)
        {
            var pdf = await _svc.BuildGuiaPdfAsync(idEvento, rsvp_token);
            return File(pdf, "application/pdf", $"Eventia-Guia-Hospedajes-Evento-{idEvento}.pdf");
        }
    }
}
