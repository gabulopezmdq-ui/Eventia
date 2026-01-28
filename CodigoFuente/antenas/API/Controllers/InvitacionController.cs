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
        [HttpGet("GetEvento")]
        public async Task<IActionResult> GetEvento([FromQuery] string token)
        {
            return Ok(await _invitacionService.ObtenerEventoAsync(token));
        }

        [HttpPost("Confirmar")]
        public async Task<IActionResult> Confirmar([FromBody] RsvpConfirmacionRequest request)
        {
            await _invitacionService.ConfirmarAsync(
                request.Token,
                request.Datos
            );

            return Ok();
        }


        [Authorize]
        [HttpPost("GenerarLink")]
        public async Task<IActionResult> GenerarLink([FromBody] GenerarLinkRequest req)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var token = await _invitacionService.GenerarLinkAsync(
                req.IdEvento,
                userId
            );

            return Ok(new { token });
        }

        [HttpPost("CargarInvitados")]
        public async Task<IActionResult> CargarInvitados([FromBody] CargaInvitadosRequest req)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _invitacionService.CargarInvitadosAsync(req, userId);

            return Ok();
        }
    }
}
