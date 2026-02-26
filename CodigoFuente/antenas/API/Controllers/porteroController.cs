using  API.DataSchema;
using API.DataSchema.DTO;
using  API.Services;
using  API.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using rsAPIElevador.DataSchema;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class porteroController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios> _service;
        private readonly IPorteroService _svc;
        public porteroController(IPorteroService svc )
        {
            _svc = svc;
            // otros assignments
        }


        // 1) Escanear QR (devuelve ficha + autorizados)
        [HttpPost("scan")]
        public async Task<IActionResult> Scan([FromBody] ScanRequest request)
        {
            // Opcional: obtener deviceId desde header si lo deseas
            string? deviceId = Request.Headers["Device-Id"].FirstOrDefault();
            long? idUsuarioOperador = null;
            string? ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            string? ua = Request.Headers.UserAgent.ToString();

            var result = await _svc.ScanQrAsync(request.QrToken, deviceId, idUsuarioOperador, ip, ua);
            if (result == null) return NotFound("QR inválido.");
            return Ok(result);
        }

        // 2) Confirmar retiro
        [HttpPost("retiro")]
        public async Task<IActionResult> ConfirmarRetiro([FromBody] RetiroConfirmRequestDTO dto)
        {
            try
            {
                long? idUsuarioOperador = null; // si hay auth, lo tomás de claims
                var result = await _svc.ConfirmarRetiroAsync(dto.qrToken, dto, idUsuarioOperador);
                return Ok(result);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
        }


        [HttpGet("retiros")]
        public async Task<IActionResult> Retiros(long idEvento, [FromQuery] DateTimeOffset? desde = null, [FromQuery] DateTimeOffset? hasta = null)
        {
            var result = await _svc.ListRetirosAsync(idEvento, desde, hasta);
            return Ok(result);
        }

        [HttpGet("scanList")]
        public async Task<IActionResult> Scans(long idEvento, [FromQuery] DateTimeOffset? desde = null, [FromQuery] DateTimeOffset? hasta = null, [FromQuery] string? resultado = null)
        {
            var result = await _svc.ListScansAsync(idEvento, desde, hasta, resultado);
            return Ok(result);
        }

        [HttpGet("pendientesRetiro")]
        public async Task<IActionResult> PendientesRetiro(long idEvento)
        {
            var result = await _svc.ListPendientesRetiroAsync(idEvento);
            return Ok(result);
        }

        [HttpGet("resumen")]
        public async Task<IActionResult> Resumen(long idEvento)
        {
            var result = await _svc.GetResumenAsync(idEvento);
            return Ok(result);
        }


        [HttpPost("retiroQR")]
        public async Task<IActionResult> ConfirmarRetiroQR([FromBody] RetiroConfirmRequestDTO request)
        {
            try
            {
                long? idUsuarioOperador = null; // Si hay autenticación
                var result = await _svc.ConfirmarRetiroAsyncQR(request.qrToken, request, idUsuarioOperador);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error interno del servidor." });
            }
        }
    }
}