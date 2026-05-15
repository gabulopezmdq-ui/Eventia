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
        private readonly IPorteroService _svc;
        public porteroController(IPorteroService svc )
        {
            _svc = svc;
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

        // 2) Registrar ingreso
        [HttpPost("checkin")]
        public async Task<IActionResult> Checkin([FromBody] CheckinRequest request)
        {
            try
            {
                string? deviceId = Request.Headers["Device-Id"].FirstOrDefault();
                long? idUsuarioOperador = null;
                string? ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                string? ua = Request.Headers.UserAgent.ToString();

                var ok = await _svc.RegistrarCheckinAsync(
                    request.IdInvitado,
                    request.IdAcceso,
                    deviceId,
                    idUsuarioOperador,
                    ip,
                    ua
                );

                return Ok(new { ok = ok });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class ScanRequest
    {
        public string QrToken { get; set; } = null!;
    }

    public class CheckinRequest
    {
        public long IdInvitado { get; set; }
        public long IdAcceso { get; set; }
    }
}
