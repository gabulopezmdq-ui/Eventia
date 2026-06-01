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
    public class autorizacionController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DataContext _context;
        private readonly ICRUDService<ef_autorizaciones> _service;
        private readonly IAutorizacionesService _svc;


        public autorizacionController(
            IConfiguration config,
            DataContext context,
            ICRUDService<ef_autorizaciones> service,
            IAutorizacionesService svc)
        {
            _config = config;
            _context = context;
            _service = service;
            _svc = svc;
        }
        [HttpPost]
        public async Task<IActionResult> Create(long idEvento, [FromBody] AutorizacionCreateDTO dto)
        {
            try
            {
                var result = await _svc.CreateAsync(idEvento, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Listar autorizados de un invitado objetivo, por tipo (por defecto retiro)
        [HttpGet("invitado/{idInvitadoObjetivo:long}")]
        public async Task<IActionResult> List(long idEvento, long idInvitadoObjetivo, [FromQuery] string tipo = "R")
        {
            var result = await _svc.ListAsync(idEvento, idInvitadoObjetivo, tipo);
            return Ok(result);
        }

        [HttpDelete("{idAutorizacion:long}")]
        public async Task<IActionResult> Disable(long idEvento, long idAutorizacion)
        {
            await _svc.DisableAsync(idEvento, idAutorizacion);
            return NoContent();
        }

        [HttpPut("{idAutorizacion:long}")]
        public async Task<IActionResult> Update(long idEvento, long idAutorizacion, [FromBody] AutorizacionUpdateDTO dto)
        {
            try
            {
                var result = await _svc.UpdateAsync(idEvento, idAutorizacion, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpPost("p/{rsvpToken}/autorizaciones")]
        public async Task<IActionResult> CreateFromPersonal(string rsvpToken, [FromBody] AutorizacionFromPersonalLinkDTO dto)
        {
            try
            {
                var result = await _svc.CreateFromPersonalLinkAsync(rsvpToken, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpGet("p/{rsvpToken}/autorizaciones")]
        public async Task<IActionResult> ListFromPersonal(string rsvpToken)
        {
            try
            {
                var result = await _svc.ListFromPersonalLinkAsync(rsvpToken);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
