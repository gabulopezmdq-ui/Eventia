using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Threading.Tasks;
using System;

[ApiController]
[Route("api/[controller]")]
public class DocentesController : ControllerBase
{
    private readonly PartesDiariosService _partesDiariosService;
    private readonly ILogger<DocentesController> _logger;

    public DocentesController(
        PartesDiariosService partesDiariosService,
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
            var resultado = await _partesDiariosService.ObtenerHistoricoDocentes(desde, hasta);
            return Ok(resultado);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error al comunicarse con Partes Diarios");
            return StatusCode(502, "Error al comunicarse con el servicio externo");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado");
            return StatusCode(500, "Error interno del servidor");
        }
    }
}