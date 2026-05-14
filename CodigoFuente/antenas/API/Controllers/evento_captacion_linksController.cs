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
    public class evento_captacion_linksController : ControllerBase
    {
        private readonly IEventoCaptacionLinksService _service;

        public evento_captacion_linksController(IEventoCaptacionLinksService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("GetByEvento")]
        public async Task<ActionResult> GetByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();
            bool esSuperadmin = User.IsInRole("SUPERADMIN");
            return Ok(await _service.GetByEventoAsync(idUsuario, idEvento, esSuperadmin));
        }

        [Authorize]
        [HttpGet("GetById")]
        public async Task<ActionResult> GetById([FromQuery] long idAccesoLink)
        {
            long idUsuario = User.GetUserId();
            bool esSuperadmin = User.IsInRole("SUPERADMIN");
            return Ok(await _service.GetByIdAsync(idUsuario, idAccesoLink, esSuperadmin));
        }

        [Authorize]
        [HttpPost("Upsert")]
        public async Task<ActionResult> Upsert([FromQuery] long idEvento, [FromBody] EventoCaptacionLinkUpsertRequest req)
        {
            long idUsuario = User.GetUserId();
            bool esSuperadmin = User.IsInRole("SUPERADMIN");
            return Ok(await _service.UpsertAsync(idUsuario, idEvento, req, esSuperadmin));
        }

        [Authorize]
        [HttpPut("SetActivo")]
        public async Task<ActionResult> SetActivo([FromQuery] long idAccesoLink, [FromQuery] bool activo)
        {
            long idUsuario = User.GetUserId();
            bool esSuperadmin = User.IsInRole("SUPERADMIN");
            return Ok(await _service.SetActivoAsync(idUsuario, idAccesoLink, activo, esSuperadmin));
        }

        [AllowAnonymous]
        [HttpGet("Landing")]
        public async Task<ActionResult> Landing([FromQuery] string token)
        {
            return Ok(await _service.GetLandingAsync(token));
        }
    }
}
