using API.DataSchema;
using API.DataSchema.DTO.Portal;
using API.Services.Portal;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers.Portal
{
    [Route("api/portal")]
    [ApiController]
    public class portalController : ControllerBase
    {
        private readonly PortalService _portalService;

        public portalController(PortalService portalService)
        {
            _portalService = portalService;
        }

        [HttpGet("{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPortal(string token, [FromQuery] int idIdioma = 1)
        {
            var result = await _portalService.GetPortalAsync(token, idIdioma);

            if (result == null)
            {
                return NotFound("Token inválido o expirado.");
            }

            return Ok(result);
        }
    }
}
