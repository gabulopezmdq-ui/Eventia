using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers.Regalos
{
    [ApiController]
    [Route("public/invitados/{rsvp_token}/regalos")]
    [AllowAnonymous]
    public class regalosPublicBundleController : ControllerBase
    {
        private readonly IRegalosPublicBundleService _service;

        public regalosPublicBundleController(IRegalosPublicBundleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> Get(string rsvp_token)
        {
            var dto = await _service.GetBundleByInvitadoTokenAsync(rsvp_token);
            if (dto == null) return NotFound(new { error = "Token inválido o invitado inexistente." });

            return Ok(dto);
        }
    }
}