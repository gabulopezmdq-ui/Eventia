using  API.DataSchema;
using API.DataSchema.DTO;
using  API.Services;
using FluentAssertions.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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

        [HttpGet("{token}")]
        public async Task<IActionResult> GetEvento(string token)
        {
            return Ok(await _invitacionService.ObtenerEventoAsync(token));
        }

        [HttpPost("{token}/confirmar")]
        public async Task<IActionResult> Confirmar(string token, [FromBody] RsvpConfirmacionDTO dto)
        {
            await _invitacionService.ConfirmarAsync(token, dto);
            return Ok();
        }

        [Authorize]
        [HttpPost("{idEvento}/rsvp-link")]
        public async Task<IActionResult> GenerarRsvp(long idEvento)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var link = await _invitacionService.GenerarLinkAsync(idEvento, userId);
            return Ok(new { link });
        }

    }
}
