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
        private readonly loginService _loginService;
        private readonly AuthContextService _authContextService;

        public authController(loginService loginService, AuthContextService authContextService)
        {
            _loginService = loginService;
            _authContextService = authContextService;
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
        public async Task<ActionResult<Auth_me_responseDTO>> me()
        {
            try
            {
                var idUsuarioStr = User.Claims.FirstOrDefault(c => c.Type == "id_usuario")?.Value
                                   ?? User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

                if (string.IsNullOrWhiteSpace(idUsuarioStr))
                    return Unauthorized(new { message = "No se pudo obtener el id_usuario del token." });

                long id_usuario = Convert.ToInt64(idUsuarioStr);

                var result = await _authContextService.GetContext(id_usuario);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<auth_login_response>> register([FromBody] auth_register_request req)
        {
            var result = await _loginService.register(req);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<auth_login_response>> login([FromBody] auth_login_request req)
        {
            var result = await _loginService.login(req);
            return Ok(result);
        }

    }
}
