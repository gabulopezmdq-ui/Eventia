using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class DocentesHistoricoController : ControllerBase
    {
        private readonly IPartesDiariosService _partesDiariosService;
        private readonly ILogger<DocentesHistoricoController> _logger;
        private const string SecretKey = "RDm7uiRh9+Ozvv7tKwfYf9x8p3oYCUqU11Fl8Xiq1Bg=";
        public DocentesHistoricoController(IPartesDiariosService partesDiariosService)
        {
            _partesDiariosService = partesDiariosService ?? throw new ArgumentNullException(nameof(partesDiariosService));
        }

        [HttpGet("Historico")]
        public async Task<IActionResult> GetHistoricoDocentes(
             [FromQuery] string desde,
             [FromQuery] string hasta)
        {
            try
            {
                // Validar fechas
                if (!DateTime.TryParse(desde, out _) || !DateTime.TryParse(hasta, out _))
                {
                    return BadRequest("Formato de fecha inválido. Use yyyy-MM-dd");
                }

                // Obtener los datos del servicio
                var resultado = await _partesDiariosService.ObtenerHistoricoDocentesAsync(desde, hasta, SecretKey);

                // Retornar el JSON obtenido del servicio externo
                return Content(resultado, "application/json");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, $"Error al comunicarse con el servicio externo: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpPost("importar-desde-historico")]
        public async Task<IActionResult> ImportarDesdeHistorico(
            [FromQuery] string desde,
            [FromQuery] string hasta,
            [FromQuery] int idCabecera,
            [FromQuery] int idInasistenciasCabecera)
            {
                try
                {
                    if (!DateTime.TryParse(desde, out _) || !DateTime.TryParse(hasta, out _))
                        return BadRequest("Fechas inválidas");

                    var json = await _partesDiariosService.ObtenerHistoricoDocentesAsync(desde, hasta, SecretKey);

                    await _partesDiariosService.ImportarJSON(json, idCabecera, idInasistenciasCabecera);

                    return Ok("Registros importados exitosamente");
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Error: {ex.Message}");
                }
            }

        [HttpGet("Token")]
        public IActionResult GenerarToken([FromQuery] DateTime? timestamp = null)
        {
            try
            {
                var token = _partesDiariosService.GenerarApiKey(SecretKey, timestamp);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al generar el token: {ex.Message}");
            }
        }
    }
}