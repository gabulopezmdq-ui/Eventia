using API.DataSchema.DTO.Portal;
using API.Services.Portal;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers.Portal
{
    [ApiController]
    [Route("portal")]
    public class portalSeguridadController : ControllerBase
    {
        private readonly PortalSeguridadService _service;

        public portalSeguridadController(PortalSeguridadService service)
        {
            _service = service;
        }

        [HttpPost("{tokenConsulta}/solicitar-codigo")]
        public async Task<IActionResult> SolicitarCodigo(string tokenConsulta, [FromBody] SolicitarCodigoPortalRequestDTO req)
        {
            var result = await _service.SolicitarCodigoAsync(tokenConsulta, req);
            return Ok(result);
        }

        [HttpPost("{tokenConsulta}/validar-codigo")]
        public async Task<IActionResult> ValidarCodigo(string tokenConsulta, [FromBody] ValidarCodigoPortalRequestDTO req)
        {
            var result = await _service.ValidarCodigoAsync(tokenConsulta, req);
            return Ok(result);
        }
    }
}
