using  API.DataSchema;
using API.DataSchema.DTO;
using  API.Services;
using API.Utility;
using FluentAssertions.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core.Tokenizer;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class invitacionController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_invitados> _serviceGenerico;
        private readonly ILogger<invitacionController> _logger;
        private readonly IInvitacionService _invitacionService;

        public invitacionController(DataContext context, ILogger<invitacionController> logger, ICRUDService<ef_invitados> serviceGenerico, IInvitacionService invitacionService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _invitacionService = invitacionService;
        }

        [HttpPost("CrearLinkGenerico")] //invitacion generica
        public async Task<IActionResult> CrearLinkGenerico([FromBody] CrearLinkGenericoDTO dto)
        {
            var token = await _invitacionService.CrearLinkGenericoAsync(dto);
            return Ok(new { token });
        }

        [HttpPost("GenerarLinkInvitacion")]//token generico
        public async Task<IActionResult> GenerarLinkInvitacion()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var token = await _invitacionService.GenerarLinkInvitacionAsync(userId);

            return Ok(new
            {
                token
            });
        }

        [HttpGet("DatosInvitacion/{token}")]//datos de la invitacion con el token generico
        public async Task<IActionResult> DatosInvitacion(string token)
        {
            var data = await _invitacionService.ObtenerDatosInvitacionAsync(token);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        [HttpGet("Invitados")] //obtener tokens
        public async Task<IActionResult> GetInvitados([FromQuery] long idEvento)
        {
            var result = await _invitacionService.ObtenerInvitadosParaEnvioAsync(idEvento);
            return Ok(result);
        }

        [HttpPost("Confirmar")]//confirmacion de asistencia
        public async Task<IActionResult> Confirmar([FromBody] RsvpConfirmacionRequest request)
        {
            await _invitacionService.ConfirmarAsync(
                request.Token,
                request.Datos
            );

            return Ok();
        }



        [HttpPost("CargarInvitados")] //precarga de invitados
        public async Task<IActionResult> CargarInvitados([FromBody] CargaInvitadosRequest req)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _invitacionService.CargarInvitadosAsync(req, userId);

            return Ok();
        }
    }
}
