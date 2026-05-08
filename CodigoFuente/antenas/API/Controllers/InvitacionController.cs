using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("invitacion")]
    public class InvitacionController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<InvitacionController> _logger;
        private readonly IInvitacionService _invitacionService;

        public InvitacionController(
            DataContext context,
            ILogger<InvitacionController> logger,
            IInvitacionService invitacionService)
        {
            _context = context;
            _logger = logger;
            _invitacionService = invitacionService;
        }

        /// <summary>
        /// Carga manual de un grupo de invitados (creador del evento)
        [Authorize]
        [HttpPost("grupo")]
        public async Task<IActionResult> CrearGrupoInvitacion([FromBody] CrearGrupoInvitacionRequest req)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _invitacionService.CargarInvitadosAsync(req, userId);

            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("tokens")]
        public async Task<IActionResult> ObtenerTokensInvitados([FromQuery] long idEvento)
        {
            var result = await _invitacionService.ObtenerInvitadosParaEnvioAsync(idEvento);

            return Ok(result);
        }

        [Authorize]
        [HttpPost("link-generico")]
        public async Task<IActionResult> GenerarLinkGenerico([FromBody] CrearLinkGenericoDTO req)
        {
            var token = await _invitacionService.CrearLinkGenericoAsync(req);

            return Ok(new { token });
        }

        [AllowAnonymous]
        [HttpGet("datos/{token}")]
        public async Task<IActionResult> ObtenerDatosInvitacion(string token)
        {
            var data = await _invitacionService.ObtenerDatosInvitacionAsync(token);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        [AllowAnonymous]
        [HttpPost("confirmar")]
        public async Task<IActionResult> ConfirmarAsistencia([FromBody] RsvpConfirmacionRequest request)
        {
            await _invitacionService.ConfirmarAsync(
                request.Token,
                request.Datos
            );

            return Ok();
        }

        [HttpGet("{token}")]
        public async Task<ActionResult<InvitacionTitularDTO>> GetInvitacion(string token)
        {
            try
            {
                var result = await _invitacionService.ObtenerInvitacionTitularAsync(token);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("{token}/confirmar")]
        public async Task<IActionResult> Confirmar([FromRoute] string token, [FromBody] RsvpConfirmacionDTO datos)
        {
            try
            {
                await _invitacionService.ConfirmarAsync(token, datos);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("registro")]
        public async Task<IActionResult> RegistrarDesdeLink([FromBody] RegistroLinkRequest request)
        {
            try
            {
                var tokenTitular = await _invitacionService.RegistrarGrupoDesdeLinkAsync(request.TokenLink, request);
                return Ok(new { token = tokenTitular });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
