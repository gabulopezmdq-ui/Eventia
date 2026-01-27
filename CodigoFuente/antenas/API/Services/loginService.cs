using API.DataSchema;
using API.DataSchema.DTO;
using DocumentFormat.OpenXml.Math;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace API.Services
{
    public class loginService : IloginService
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;

        public loginService(DataContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<auth_login_response> login_google(auth_google_request req)
        {
            var googleClientId = _config["GoogleAuth:ClientId"];
            if (string.IsNullOrWhiteSpace(googleClientId))
                throw new UnauthorizedAccessException("GoogleAuth:ClientId no configurado.");

            // 1) Validar token de Google
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                req.id_token,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { googleClientId }
                });

            var googleSub = payload.Subject;
            var email = payload.Email;

            // 2) Buscar usuario por google_sub
            var usuario = await _context.Set<ef_usuarios>()
                .FirstOrDefaultAsync(u => u.google_sub == googleSub);

            // 3) Fallback por email (linkeo de cuenta)
            if (usuario == null && !string.IsNullOrWhiteSpace(email))
            {
                usuario = await _context.Set<ef_usuarios>()
                    .FirstOrDefaultAsync(u => u.email == email);
            }

            // 4) Crear usuario si no existe
            if (usuario == null)
            {
                if (string.IsNullOrWhiteSpace(email))
                    throw new UnauthorizedAccessException("Google no devolvió email.");

                usuario = new ef_usuarios
                {
                    email = email,
                    password_hash = null,
                    nombre = payload.GivenName ?? "(sin nombre)",
                    apellido = payload.FamilyName ?? "(sin apellido)",
                    email_verificado = payload.EmailVerified,
                    activo = true,

                    auth_provider = "google",
                    google_sub = googleSub,
                    avatar_url = payload.Picture
                };

                _context.Add(usuario);
                await _context.SaveChangesAsync();
            }
            else
            {
                if (!usuario.activo)
                    throw new UnauthorizedAccessException("Usuario inactivo.");

                // refresco datos Google (opcional)
                usuario.auth_provider = "google";
                usuario.google_sub = googleSub;
                usuario.avatar_url = payload.Picture;
                usuario.email_verificado = usuario.email_verificado || payload.EmailVerified;
                usuario.fecha_modif = DateTimeOffset.UtcNow;

                await _context.SaveChangesAsync();
            }

            // 5) Generar JWT (SIN roles)
            //var jwtResult = generar_jwt(usuario);
            var jwtResult = await generar_jwt_async(usuario);

            return new auth_login_response
            {
                access_token = jwtResult.token,
                expires_at_utc = jwtResult.expiresAtUtc
            };
        }

        //private (string token, DateTimeOffset expiresAtUtc) generar_jwt(ef_usuarios usuario)
        //{
        //    var issuer = _config["Jwt:Issuer"];
        //    var audience = _config["Jwt:Audience"];
        //    var key = _config["Jwt:Key"];

        //    if (string.IsNullOrWhiteSpace(key))
        //        throw new InvalidOperationException("Jwt:Key no configurado.");

        //    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        //    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        //    var claims = new List<Claim>
        //    {
        //        new Claim(JwtRegisteredClaimNames.Sub, usuario.id_usuario.ToString()),
        //        new Claim("id_usuario", usuario.id_usuario.ToString()),
        //        new Claim(JwtRegisteredClaimNames.Email, usuario.email)
        //    };

        //    var expiresAtUtc = DateTimeOffset.UtcNow.AddHours(8);

        //    var jwt = new JwtSecurityToken(
        //        issuer: issuer,
        //        audience: audience,
        //        claims: claims,
        //        notBefore: DateTime.UtcNow,
        //        expires: expiresAtUtc.UtcDateTime,
        //        signingCredentials: credentials
        //    );

        //    return (new JwtSecurityTokenHandler().WriteToken(jwt), expiresAtUtc);
        //}

        private async Task<(string token, DateTimeOffset expiresAtUtc)> generar_jwt_async(ef_usuarios usuario)
        {
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];
            var key = _config["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(key))
                throw new InvalidOperationException("Jwt:Key no configurado.");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, usuario.id_usuario.ToString()),
        new Claim("id_usuario", usuario.id_usuario.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, usuario.email)
    };

            var roles = await (
                from ur in _context.Set<ef_usuarios_roles>()
                join r in _context.Set<ef_roles>() on ur.id_rol equals r.id_rol
                where ur.id_usuario == usuario.id_usuario
                      && ur.activo == true
                      && r.activo == true
                select r.codigo
            ).Distinct().ToListAsync();

            foreach (var rol in roles)
                claims.Add(new Claim(ClaimTypes.Role, rol)); // <-- SUPERADMIN entra acá

            var expiresAtUtc = DateTimeOffset.UtcNow.AddHours(8);

            var jwt = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expiresAtUtc.UtcDateTime,
                signingCredentials: credentials
            );

            return (new JwtSecurityTokenHandler().WriteToken(jwt), expiresAtUtc);
        }

        public async Task<auth_login_response> register(auth_register_request req)
        {
            var existe = await _context.Set<ef_usuarios>()
                .AnyAsync(u => u.email == req.email);

            if (existe)
                throw new InvalidOperationException("El email ya está registrado.");

            var usuario = new ef_usuarios
            {
                email = req.email,
                password_hash = BCrypt.Net.BCrypt.HashPassword(req.password),
                nombre = req.nombre,
                apellido = req.apellido,
                email_verificado = false,
                activo = true,
                auth_provider = "local"
            };

            _context.Add(usuario);
            await _context.SaveChangesAsync();

            //var jwt = generar_jwt(usuario);
            var jwt = await generar_jwt_async(usuario);

            return new auth_login_response
            {
                access_token = jwt.token,
                expires_at_utc = jwt.expiresAtUtc
            };
        }

        public async Task<auth_login_response> login(auth_login_request req)
        {
            var usuario = await _context.Set<ef_usuarios>()
                .FirstOrDefaultAsync(u => u.email == req.email);

            if (usuario == null || !usuario.activo)
                throw new UnauthorizedAccessException("Credenciales inválidas.");

            if (usuario.password_hash == null ||
                !BCrypt.Net.BCrypt.Verify(req.password, usuario.password_hash))
                throw new UnauthorizedAccessException("Credenciales inválidas.");

            //var jwt = generar_jwt(usuario);
            var jwt = await generar_jwt_async(usuario);

            return new auth_login_response
            {
                access_token = jwt.token,
                expires_at_utc = jwt.expiresAtUtc
            };
        }

    }
}
