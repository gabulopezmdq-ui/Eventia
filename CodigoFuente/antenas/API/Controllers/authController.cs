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
    [Route("auth")]
    public class authController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios> _service;
        private readonly loginService _loginService;

        public authController(loginService loginService)
        {
            _loginService = loginService;
        }

        // POST /auth/google
        [AllowAnonymous]
        [HttpPost("google")]
        public async Task<ActionResult<auth_login_response>> google([FromBody] auth_google_request req)
        {
            try
            {
                var result = await _loginService.login_google(req);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // por ejemplo: "No existe el rol EVENT_OWNER"
                return BadRequest(new { message = ex.Message });
            }
        }


        [Authorize]
        [HttpGet("me")]
        public ActionResult me()
        {
            var idUsuario = User.Claims.FirstOrDefault(c => c.Type == "id_usuario")?.Value;
            var email = User.Claims.FirstOrDefault(c => c.Type.EndsWith("/emailaddress") || c.Type == "email")?.Value;
            var roles = User.Claims.Where(c => c.Type.EndsWith("/role")).Select(c => c.Value).ToList();

            return Ok(new
            {
                id_usuario = idUsuario,
                email = email,
                roles = roles
            });
        }
    }
}