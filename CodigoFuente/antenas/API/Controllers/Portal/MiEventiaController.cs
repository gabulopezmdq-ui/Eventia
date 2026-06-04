using System;
using System.Linq;
using System.Threading.Tasks;
using API.DataSchema;
using API.DataSchema.DTO.Portal;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Portal
{
    [ApiController]
    [Route("mi-eventia")]
    public class MiEventiaController : ControllerBase
    {
        private readonly MiEventiaService _service;
        public MiEventiaController(MiEventiaService service)
        {
            _service = service;
        }

        [HttpGet("{tokenPortal:guid}")]
        [ApiExplorerSettings(GroupName = "Mi-Eventia")]
        [ProducesResponseType(typeof(MiEventiaResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Get(Guid tokenPortal)
        {
            var result = await _service.GetMiEventiaAsync(tokenPortal);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpPost("recuperar")]
        public async Task<IActionResult> Recuperar([FromBody] RecuperarMiEventiaRequestDTO req)
        {
            var result = await _service.RecuperarAccesoAsync(req);
            return Ok(result);
        }

        [HttpPost("regenerar-codigo")]
        public async Task<IActionResult> RegenerarCodigo([FromBody] RecuperarMiEventiaRequestDTO req)
        {
            var result = await _service.RegenerarCodigoAccesoAsync(req);
            return Ok(result);
        }

        [HttpPost("validar-recuperacion")]
        public async Task<IActionResult> ValidarRecuperacion([FromBody] ValidarRecuperacionRequestDTO req)
        {
            var result = await _service.ValidarRecuperacionAsync(req);
            return Ok(result);
        }
    }
}
