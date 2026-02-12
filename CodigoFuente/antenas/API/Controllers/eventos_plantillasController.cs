using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class eventos_plantillasController : ControllerBase
    {
        private readonly IEventoPlantillasService _service;
        private readonly ILogger<eventos_plantillasController> _logger;

        public eventos_plantillasController(IEventoPlantillasService service, ILogger<eventos_plantillasController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // POST /eventos_plantillas/Aplicar?idEvento=4
        [HttpPost("Aplicar")]
        public async Task<IActionResult> Aplicar([FromQuery] long idEvento, [FromBody] AplicarPlantillaRequestDTO req)
        {
            await _service.AplicarPlantillaAsync(idEvento, req.id_plantilla, req.borrar_existente);
            return Ok(new { ok = true });
        }
    }
}