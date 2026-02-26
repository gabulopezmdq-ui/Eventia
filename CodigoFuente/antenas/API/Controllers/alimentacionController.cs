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
    public class alimentacionController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios> _service;
        private readonly IAlimentacionService _svc;
        public alimentacionController(IAlimentacionService svc) => _svc = svc;



        public alimentacionController(IConfiguration config, DataContext context, ICRUDService<ef_usuarios> service)
        {
            _config = config;
            _context = context;
            _service = service;
        }

        [HttpGet("restricciones-alimentarias")]
        public async Task<IActionResult> GetRestricciones([FromQuery] bool soloActivas = true)
       => Ok(await _svc.GetCatalogoAsync(soloActivas));

        [HttpPut("p/{rsvpToken}/ninos/{idInvitadoNino:long}/alimentacion")]
        public async Task<IActionResult> UpdateAlimentacion(string rsvpToken, long idInvitadoNino, [FromBody] NinoAlimentacionUpdateDTO dto)
        {
            try
            {
                await _svc.UpdateNinoAlimentacionFromPersonalAsync(rsvpToken, idInvitadoNino, dto);
                return NoContent();
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return Conflict(ex.Message); }
        }

        [HttpGet("ninos-alertas")]
        public async Task<IActionResult> NinosAlertas(long idEvento, [FromQuery] short minSeveridad = 4)
        => Ok(await _svc.ListNinosAlertasAsync(idEvento, minSeveridad));
    }
}