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
    public class audienciasController : ControllerBase
    {
        private readonly IAudienciasService _service;

        public audienciasController(IAudienciasService service)
        {
            _service = service;
        }

        [AllowAnonymous]
        [HttpPost("Registrar")]
        public async Task<ActionResult> Registrar([FromQuery] string token, [FromBody] EventoCaptacionRegistroRequest req)
        {
            return Ok(await _service.RegistrarDesdeLinkAsync(token, req));
        }

        [Authorize]
        [HttpGet("GetRegistrosEvento")]
        public async Task<ActionResult> GetRegistrosEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.GetRegistrosEventoAsync(idUsuario, idEvento));
        }

        [Authorize]
        [HttpGet("GetMetricasEvento")]
        public async Task<ActionResult> GetMetricasEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.GetMetricasEventoAsync(idUsuario, idEvento));
        }

        [Authorize]
        [HttpGet("GetAll")]
        public async Task<ActionResult> GetAll([FromQuery] bool soloActivas = true)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.GetAudienciasCuentaAsync(idUsuario, soloActivas));
        }

        [Authorize]
        [HttpGet("GetById")]
        public async Task<ActionResult> GetById([FromQuery] long idAudienciaPersona)
        {
            long idUsuario = User.GetUserId();
            return Ok(await _service.GetAudienciaDetalleAsync(idUsuario, idAudienciaPersona));
        }
    }
}
