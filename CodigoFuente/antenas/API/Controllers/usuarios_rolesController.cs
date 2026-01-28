using  API.DataSchema;
using API.DataSchema.DTO;
using  API.Services;
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
    public class usuarios_rolesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios_roles> _serviceGenerico;
        private readonly ILogger<usuarios_rolesController> _logger;
        private readonly IInvitacionService _invitacionService;

        public usuarios_rolesController(DataContext context, ILogger<usuarios_rolesController> logger, ICRUDService<ef_usuarios_roles> serviceGenerico, IInvitacionService invitacionService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _invitacionService = invitacionService;
        }


        // GET invitacion/GetEvento?token=XXXX
        [HttpGet("GetEvento")]
        public async Task<IActionResult> GetEvento([FromQuery] string token)
        {
            var data = await _invitacionService.ObtenerEventoAsync(token);
            return Ok(data);
        }

        // POST invitacion/Confirmar
        [HttpPost("Confirmar")]
        public async Task<IActionResult> Confirmar([FromBody] RsvpConfirmacionRequest request)
        {
            await _invitacionService.ConfirmarAsync(
                request.Token,
                request.Datos
            );

            return Ok();
        }

        // POST invitacion/GenerarRsvp
        [Authorize]
        [HttpPost("GenerarRsvp")]
        public async Task<IActionResult> GenerarRsvp([FromQuery] long idEvento)
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var link = await _invitacionService.GenerarLinkAsync(idEvento, userId);

            return Ok(new { link });
        }
    }
}