using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("[controller]")]
public class qrController : ControllerBase
{
    private readonly IQrService _svc;
    private readonly ILogger<qrController> _logger;

    public qrController(IQrService svc, ILogger<qrController> logger)
    {
        _svc = svc;
        _logger = logger;
    }

    [HttpGet("{qrToken}")]
    public async Task<IActionResult> Get(string qrToken)
    {
        try
        {
            _logger.LogInformation("Iniciando Get para QR: {QrToken}", qrToken);

            if (string.IsNullOrEmpty(qrToken))
            {
                _logger.LogWarning("QR token vacío o nulo");
                return BadRequest("QR token requerido");
            }

            _logger.LogInformation("Llamando a GetByQrTokenAsync");
            var result = await _svc.GetByQrTokenAsync(qrToken);

            _logger.LogInformation("Resultado obtenido: {Result}", result != null ? "OK" : "NULL");

            if (result == null)
            {
                _logger.LogWarning("QR no encontrado: {QrToken}", qrToken);
                return NotFound("QR inválido.");
            }

            _logger.LogInformation("Retornando OK con resultado");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en Get para QR: {QrToken}", qrToken);
            return StatusCode(500, new { error = "Error interno del servidor", details = ex.Message });
        }
    }
}
