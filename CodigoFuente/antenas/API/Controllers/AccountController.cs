using  API.DataSchema;
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
    [Route("Account")]
    public class AccountController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DataContext _context;
        private readonly ICRUDService<ef_usuarios> _service;


        public AccountController(IConfiguration config, DataContext context, ICRUDService<ef_usuarios> service)
        {
            _config = config;
            _context = context;
            _service = service;
        }

        //[HttpPost("Login")]
        //public async Task<ActionResult> Index([FromBody] UserInfo userinfo)
        //{
        //    string domain = _config.GetValue<string>("Ldap:Dominio");
        //    int port = int.Parse(_config.GetValue<string>("Ldap:Puerto"));
        //    string user = userinfo.Usuario;
        //    string password = userinfo.Password;
        //    var usuarios = await _service.GetByParam(u => u.Nombre == user);
        //    var usuario = usuarios.FirstOrDefault();
        //    if (usuarios.Count() > 0)
        //    {
        //        bool isValied = new LdapManager(_config).Validate(user, password);// HABILITAR PARA VALIDAR
        //        if (isValied)
        //            return Ok(BuildToken(usuario.IdUsuario));
        //        else
        //            return BadRequest();
        //    }
        //    else
        //        return BadRequest();
        //}

        

        //private IActionResult BuildToken(int userId)
        //{
        //    //guarda los datos usuario
        //    var usuario = _context.ef_usuarios
        //                .Include(u => u.UsuariosXRoles)
        //                .ThenInclude(ur => ur.Rol)  
        //                .FirstOrDefault(u => u.IdUsuario == userId);

        //    //guarda los roles en caso de que tenga mas de uno
        //    var roles = usuario.UsuariosXRoles.Select(ur => ur.Rol?.NombreRol).Where(r => !string.IsNullOrEmpty(r)).ToList();

        //    // Obtener idEstablecimiento vigente (el primero que encuentre)
        //    var idEstablecimientos = _context.MEC_UsuariosEstablecimientos
        //                            .Where(uxe => uxe.IdUsuario == userId && uxe.Vigente == "S")
        //                            .Select(uxe => uxe.IdEstablecimiento)
        //                            .ToList();

        //    var claims = new List<Claim>
        //    {
        //        new Claim(ClaimTypes.Name, usuario.Nombre),
        //        new Claim("id", usuario.IdUsuario.ToString())
        //    };

        //    foreach (var id in idEstablecimientos)
        //    {
        //        claims.Add(new Claim("idEstablecimiento", id.ToString()));
        //    }


        //    claims.AddRange(roles.Select(rol => new Claim(ClaimTypes.Role, rol)));

        //    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetValue<string>("Ldap:Key")));
        //    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        //    var expiration = DateTime.UtcNow.AddHours(1);

        //    JwtSecurityToken token = new JwtSecurityToken(
        //       issuer: _config.GetValue<string>("Ldap:Dominio"),
        //       audience: _config.GetValue<string>("Ldap:Dominio"),
        //       claims: claims,
        //       expires: expiration,
        //       signingCredentials: creds);
        //    return Ok(new
        //    {
        //        token = new JwtSecurityTokenHandler().WriteToken(token),
        //        expiration = expiration
        //    });

        //}
    }
}
