using API.DataSchema;
using API.DataSchema.DTO.Staff;
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

namespace API.Services.Staff
{
    public class StaffService
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;

        public StaffService(DataContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ─────────────────────────────────────
        // GENERACIÓN DE CÓDIGO ÚNICO (8 caracteres: CCRRNNNN)
        // ─────────────────────────────────────
        private async Task<string> GenerarCodigoUnicoAsync(long idCuenta, short idRol)
        {
            // 1. Prefijo Cuenta (CC)
            var cuenta = await _context.ef_cuentas.AsNoTracking().FirstOrDefaultAsync(x => x.id_cuenta == idCuenta);
            string prefixCuenta = NormalizarParaCodigo(cuenta?.nombre_cuenta, 2);

            // 2. Prefijo Rol (RR) - Tomamos lo que viene después de STAFF_
            var rol = await _context.ef_roles.AsNoTracking().FirstOrDefaultAsync(x => x.id_rol == idRol);
            string rolNombre = rol?.codigo ?? "XX";
            if (rolNombre.Contains("_"))
            {
                rolNombre = rolNombre.Split('_').Last();
            }
            string prefixRol = NormalizarParaCodigo(rolNombre, 2);

            var rng = new Random();
            string codigo;
            do
            {
                // 3. Sufijo Numérico (NNNN)
                string num = rng.Next(0, 10000).ToString("D4");
                codigo = $"{prefixCuenta}{prefixRol}{num}";
            }
            while (await _context.ef_staff.AnyAsync(x => x.codigo == codigo));

            return codigo;
        }

        private string NormalizarParaCodigo(string text, int length)
        {
            if (string.IsNullOrWhiteSpace(text)) return new string('X', length);
            var clean = new string(text.Where(char.IsLetterOrDigit).ToArray()).ToUpper();
            if (clean.Length < length) return clean.PadRight(length, 'X');
            return clean.Substring(0, length);
        }

        // ─────────────────────────────────────
        // CREAR STAFF (ACCOUNT_ADMIN)
        // El admin carga los datos. El empleado solo usa el código.
        // ─────────────────────────────────────
        public async Task<StaffCreadoDTO> CrearStaffAsync(CrearStaffRequest req)
        {
            var codigo = await GenerarCodigoUnicoAsync(req.id_cuenta, req.id_rol);

            var staff = new ef_staff
            {
                id_cuenta        = req.id_cuenta,
                id_rol           = req.id_rol,
                codigo           = codigo,
                nombre           = req.nombre?.Trim(),
                apellido         = req.apellido?.Trim(),
                email            = req.email?.Trim(),
                telefono         = req.telefono?.Trim(),
                fecha_expiracion = req.fecha_expiracion,
                activo           = true,
                usos             = 0,
                fecha_alta       = DateTimeOffset.UtcNow
            };

            _context.ef_staff.Add(staff);
            await _context.SaveChangesAsync();

            // Asignar unidades
            if (req.id_unidades?.Any() == true)
            {
                foreach (var idUnidad in req.id_unidades)
                {
                    _context.ef_staff_unidades.Add(new ef_staff_unidades
                    {
                        id_staff  = staff.id_staff,
                        id_unidad = idUnidad
                    });
                }
                await _context.SaveChangesAsync();
            }

            return new StaffCreadoDTO
            {
                id_staff         = staff.id_staff,
                codigo           = staff.codigo,
                nombre           = staff.nombre,
                apellido         = staff.apellido,
                fecha_expiracion = staff.fecha_expiracion
            };
        }

        // ─────────────────────────────────────
        // LISTADO (ACCOUNT_ADMIN)
        // ─────────────────────────────────────
        public async Task<List<StaffListItemDTO>> ListarStaffAsync(long id_cuenta)
        {
            return await (
                from s in _context.ef_staff.AsNoTracking()
                join r in _context.ef_roles.AsNoTracking() on s.id_rol equals r.id_rol
                where s.id_cuenta == id_cuenta
                orderby s.activo descending, s.fecha_alta descending
                select new StaffListItemDTO
                {
                    id_staff         = s.id_staff,
                    nombre           = s.nombre,
                    apellido         = s.apellido,
                    email            = s.email,
                    telefono         = s.telefono,
                    rol_codigo       = r.codigo,
                    rol_descripcion  = r.descripcion,
                    codigo           = s.codigo,
                    activo           = s.activo,
                    fecha_expiracion = s.fecha_expiracion,
                    usos             = s.usos,
                    fecha_uso        = s.fecha_uso
                }
            ).ToListAsync();
        }

        // ─────────────────────────────────────
        // REVOCAR (ACCOUNT_ADMIN)
        // ─────────────────────────────────────
        public async Task<bool> RevocarStaffAsync(long id_cuenta, long id_staff)
        {
            var staff = await _context.ef_staff
                .FirstOrDefaultAsync(x => x.id_staff == id_staff && x.id_cuenta == id_cuenta);

            if (staff == null) return false;

            staff.activo      = false;
            staff.fecha_modif = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ─────────────────────────────────────
        // USO DEL CÓDIGO (EMPLEADO — sin login previo)
        // Solo ingresa el código y recibe un JWT de sesión
        // ─────────────────────────────────────
        public async Task<StaffContextoDTO> UsarCodigoAsync(string codigo)
        {
            var ahora = DateTimeOffset.UtcNow;

            var staff = await _context.ef_staff
                .FirstOrDefaultAsync(x => x.codigo == codigo);

            if (staff == null)
                throw new InvalidOperationException("Código inválido.");

            if (!staff.activo)
                throw new InvalidOperationException("El código está desactivado.");

            if (staff.fecha_expiracion.HasValue && staff.fecha_expiracion.Value < ahora)
                throw new InvalidOperationException("El código ha expirado.");

            // Registrar primer uso y contar accesos
            if (staff.fecha_uso == null)
                staff.fecha_uso = ahora;

            staff.usos       += 1;
            staff.fecha_modif = ahora;
            await _context.SaveChangesAsync();

            // Obtener unidades asignadas
            var unidades = await (
                from su in _context.ef_staff_unidades.AsNoTracking()
                join u in _context.ef_cuenta_unidades.AsNoTracking() on su.id_unidad equals u.id_unidad
                where su.id_staff == staff.id_staff
                select new StaffUnidadDTO
                {
                    id_unidad = u.id_unidad,
                    nombre    = u.nombre
                }
            ).ToListAsync();

            var rol = await _context.ef_roles.AsNoTracking()
                .FirstOrDefaultAsync(r => r.id_rol == staff.id_rol);

            // Generar JWT para el Staff
            var jwt = GenerarJwtStaff(staff, rol?.codigo ?? "STAFF_GENERIC");

            return new StaffContextoDTO
            {
                id_staff        = staff.id_staff,
                id_cuenta       = staff.id_cuenta,
                nombre          = staff.nombre,
                apellido        = staff.apellido,
                rol_codigo      = rol?.codigo ?? "",
                unidades        = unidades,
                access_token    = jwt.token,
                expires_at_utc  = jwt.expiresAtUtc
            };
        }

        private (string token, DateTimeOffset expiresAtUtc) GenerarJwtStaff(ef_staff staff, string rolCodigo)
        {
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];
            var key = _config["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(key))
                throw new InvalidOperationException("Jwt:Key no configurado en el servidor.");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, $"staff_{staff.id_staff}"),
                new Claim("id_staff", staff.id_staff.ToString()),
                new Claim("id_cuenta", staff.id_cuenta.ToString()),
                new Claim(ClaimTypes.Role, rolCodigo),
                new Claim("is_staff", "true")
            };

            var expiresAtUtc = DateTimeOffset.UtcNow.AddHours(12); // Staff suele tener turnos largos

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
    }
}
