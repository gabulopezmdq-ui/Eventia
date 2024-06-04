using  rsAPIElevador.DataSchema;
using  rsAPIElevador.Services;
using  rsAPIElevador.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace rsAPIElevador.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class Account : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DataContext _context;
        private readonly ICRUDService<EJ_Usuario> _service;


        public Account(IConfiguration config, DataContext context, ICRUDService<EJ_Usuario> service)
        {
            _config = config;
            _context = context;
            _service = service;
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Index([FromBody] UserInfo userinfo)
        {
            string domain = _config.GetValue<string>("Ldap:Dominio");
            int port = int.Parse(_config.GetValue<string>("Ldap:Puerto"));
            string user = userinfo.Usuario;
            string password = userinfo.Password;
            var usuarios = await _service.GetByParam(u => u.Nombre == user);
            if (usuarios.Count() > 0)
            {
                bool isValied = new LdapManager(_config).Validate(user, password);// HABILITAR PARA VALIDAR
                if (isValied)
                    return Ok(BuildToken());
                else
                    return BadRequest();
            }
            else
                return BadRequest();
        }

        private IActionResult BuildToken()
        {
            
            var claims = new[]
            {
                new Claim(ClaimTypes.Role, "Admin")
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetValue<string>("Ldap:Key")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expiration = DateTime.UtcNow.AddHours(1);

            JwtSecurityToken token = new JwtSecurityToken(
               issuer: _config.GetValue<string>("Ldap:Dominio"),
               audience: _config.GetValue<string>("Ldap:Dominio"),
               claims: claims,
               expires: expiration,
               signingCredentials: creds);
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = expiration
            });

        }
    }
}
