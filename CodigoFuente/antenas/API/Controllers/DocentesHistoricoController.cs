using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DocentesController : ControllerBase
    {
        private readonly IPartesDiariosService _partesDiariosService;
        private readonly ILogger<DocentesController> _logger;

        public DocentesController(
            IPartesDiariosService partesDiariosService,
            ILogger<DocentesController> logger)
        {
            _partesDiariosService = partesDiariosService;
            _logger = logger;
        }

        [HttpGet("historico")]
        public async Task<IActionResult> GetHistorico(
            [FromQuery] DateTime desde,
            [FromQuery] DateTime hasta)
        {
            try
            {
                _logger.LogInformation("Obteniendo histórico desde {Desde} hasta {Hasta}", desde, hasta);

                var resultado = await _partesDiariosService.ObtenerHistoricoDocentesAsync(desde, hasta);
                return Content(resultado, "application/json");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Error de validación en fechas");
                return BadRequest(ex.Message);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error al comunicarse con Partes Diarios");
                return StatusCode(502, $"Error al comunicarse con el servicio externo: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al obtener histórico");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}