using API.DataSchema.DTO.Regalos;
using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers.Regalos
{
    [ApiController]
    [Route("public/regalos/fondo")]
    [AllowAnonymous]
    public class regalosFondoPublicController : ControllerBase
    {
        private readonly IRegalosFondoService _service;

        public regalosFondoPublicController(IRegalosFondoService service)
        {
            _service = service;
        }

        [HttpPost("aportar")]
        public async Task<ActionResult> Aportar([FromBody] RegalosFondoCrearAporteDTO req)
        {
            try
            {
                var dto = await _service.CrearAportePublicoAsync(req);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}