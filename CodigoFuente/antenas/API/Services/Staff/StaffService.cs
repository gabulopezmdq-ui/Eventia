using API.DataSchema;
using API.DataSchema.DTO.Staff;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using API.Services.Cuentas;

namespace API.Services.Staff
{
    public class StaffService : IStaffService
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;

        private readonly ICuentaContextService _cuentaContext;

        public StaffService(DataContext context, IConfiguration config, ICuentaContextService cuentaContext)
        {
            _context = context;
            _config = config;
            _cuentaContext = cuentaContext;
        }

        // ─────────────────────────────────────
        // GENERACIÓN DE CÓDIGO ÚNICO (8 caracteres: CCRRNNNN)
        // ─────────────────────────────────────
        // Patrón: CCNNNNNN
        //   CC  = 2 primeras letras de la cuenta u evento (uppercase, solo alfanumérico)
        //   NN  = 2 primeras letras del NOMBRE de la persona (no del rol, para que sea
        //         estable aunque el staff tenga múltiples roles en distintos eventos)
        //   NNNN= 4 dígitos aleatorios (0000-9999)
        private async Task<string> GenerarCodigoUnicoAsync(long? idCuenta, long? idEvento, string nombre)
        {
            // 1. Prefijo Cuenta/Evento (CC)
            string prefixFirst = "XX";

            if (idCuenta.HasValue)
            {
                var cuenta = await _context.ef_cuentas.AsNoTracking().FirstOrDefaultAsync(x => x.id_cuenta == idCuenta);
                prefixFirst = NormalizarParaCodigo(cuenta?.nombre_cuenta, 2);
            }
            else if (idEvento.HasValue)
            {
                var ev = await _context.ef_eventos.AsNoTracking().FirstOrDefaultAsync(x => x.id_evento == idEvento);
                prefixFirst = NormalizarParaCodigo(ev?.anfitriones_texto ?? "EV", 2);
            }

            // 2. Prefijo Nombre (NN) - 2 primeras letras del nombre de la persona
            //    Centrado en la persona, no en el rol, para que el código sea estable
            //    incluso cuando el staff tenga múltiples roles en distintos eventos.
            string prefixNombre = NormalizarParaCodigo(nombre, 2);

            // 3. Sufijo Numérico (NNNN)
            var rng = new Random();
            string codigo;
            do
            {
                string num = rng.Next(0, 10000).ToString("D4");
                codigo = $"{prefixFirst}{prefixNombre}{num}";
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
            if (string.IsNullOrWhiteSpace(req.email))
                throw new ArgumentException("El email del staff es obligatorio.");

            var codigo = await GenerarCodigoUnicoAsync(req.id_cuenta, null, req.nombre ?? "XX");

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
                    // Validar que la unidad pertenece a la cuenta
                    bool pertenece = await _cuentaContext.UnidadPerteneceACuentaAsync(req.id_cuenta, idUnidad);
                    if (!pertenece)
                        throw new InvalidOperationException($"La unidad {idUnidad} no pertenece a la cuenta {req.id_cuenta}.");

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
        // CREAR STAFF (EVENT OWNER - B2C)
        // El anfitrión carga los datos y se asigna directamente al evento.
        // ─────────────────────────────────────
        public async Task<StaffCreadoDTO> CrearStaffEventoAsync(long idEvento, string nombre, string apellido, string email, short idRol)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("El email del staff es obligatorio.");

            var codigo = await GenerarCodigoUnicoAsync(null, idEvento, nombre ?? "XX");

            var staff = new ef_staff
            {
                id_cuenta        = null,
                id_evento        = idEvento,
                id_rol           = idRol,
                codigo           = codigo,
                nombre           = string.IsNullOrWhiteSpace(nombre) ? "Staff" : nombre.Trim(),
                apellido         = string.IsNullOrWhiteSpace(apellido) ? "Evento" : apellido.Trim(),
                email            = email.Trim(),
                activo           = true,
                usos             = 0,
                fecha_alta       = DateTimeOffset.UtcNow
            };

            _context.ef_staff.Add(staff);
            await _context.SaveChangesAsync();

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

        //// ─────────────────────────────────────
        //// USO DEL CÓDIGO (EMPLEADO — sin login previo)
        //// Solo ingresa el código y recibe un JWT de sesión
        //// ─────────────────────────────────────
        //public async Task<StaffContextoDTO> UsarCodigoAsync(string codigo)
        //{
        //    var ahora = DateTimeOffset.UtcNow;

        //    var staff = await _context.ef_staff
        //        .FirstOrDefaultAsync(x => x.codigo == codigo);

        //    if (staff == null)
        //        throw new InvalidOperationException("Código inválido.");

        //    if (!staff.activo)
        //        throw new InvalidOperationException("El código está desactivado.");

        //    if (staff.fecha_expiracion.HasValue && staff.fecha_expiracion.Value < ahora)
        //        throw new InvalidOperationException("El código ha expirado.");

        //    // Registrar primer uso y contar accesos
        //    if (staff.fecha_uso == null)
        //        staff.fecha_uso = ahora;

        //    staff.usos       += 1;
        //    staff.fecha_modif = ahora;
        //    await _context.SaveChangesAsync();

        //    // Obtener unidades asignadas
        //    var unidades = await (
        //        from su in _context.ef_staff_unidades.AsNoTracking()
        //        join u in _context.ef_cuenta_unidades.AsNoTracking() on su.id_unidad equals u.id_unidad
        //        where su.id_staff == staff.id_staff
        //        select new StaffUnidadDTO
        //        {
        //            id_unidad = u.id_unidad,
        //            nombre    = u.nombre
        //        }
        //    ).ToListAsync();

        //    var rol = await _context.ef_roles.AsNoTracking()
        //        .FirstOrDefaultAsync(r => r.id_rol == staff.id_rol);

        //    // Generar JWT para el Staff
        //    var jwt = GenerarJwtStaff(staff, rol?.codigo ?? "STAFF_GENERIC");

        //    return new StaffContextoDTO
        //    {
        //        id_staff        = staff.id_staff,
        //        id_cuenta       = staff.id_cuenta,
        //        id_evento       = staff.id_evento,
        //        nombre          = staff.nombre,
        //        apellido        = staff.apellido,
        //        rol_codigo      = rol?.codigo ?? "",
        //        unidades        = unidades,
        //        access_token    = jwt.token,
        //        expires_at_utc  = jwt.expiresAtUtc
        //    };
        //}

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

            if (staff.fecha_uso == null)
                staff.fecha_uso = ahora;

            staff.usos += 1;
            staff.fecha_modif = ahora;
            await _context.SaveChangesAsync();

            var asignaciones = await (
                from es in _context.Set<ef_evento_staff>().AsNoTracking()
                join r in _context.Set<ef_roles>().AsNoTracking() on es.id_rol equals r.id_rol
                join e in _context.ef_eventos.AsNoTracking() on es.id_evento equals e.id_evento
                where es.id_staff == staff.id_staff && es.activo
                orderby es.id_evento, r.orden_ui
                select new
                {
                    es.id_evento_staff,
                    es.id_evento,
                    e.tipo_operacion,
                    nombre_evento = e.anfitriones_texto,
                    es.id_rol,
                    r.codigo,
                    r.pantalla_inicio
                }
            ).ToListAsync();

            if (asignaciones.Count == 0)
                throw new InvalidOperationException("El staff no tiene asignaciones activas.");

            var eventosDisponibles = asignaciones
                .GroupBy(x => new { x.id_evento, x.tipo_operacion, x.nombre_evento })
                .Select(g => new StaffEventoContextoDTO
                {
                    id_evento = g.Key.id_evento,
                    tipo_operacion = g.Key.tipo_operacion,
                    nombre_evento = g.Key.nombre_evento,
                    roles_evento = g.Select(x => new API.DataSchema.DTO.Eventos.StaffJoinRolDTO
                    {
                        id_evento_staff = x.id_evento_staff,
                        id_rol = x.id_rol,
                        codigo_rol = x.codigo,
                        rol_texto = x.codigo,
                        pantalla_inicio = x.pantalla_inicio
                    }).ToList(),
                    pantalla_inicio_default = g.Count() == 1
                        ? g.First().pantalla_inicio
                        : "OPERACION_GENERAL"
                })
                .ToList();

            var jwt = GenerarJwtStaff(staff, "STAFF");

            string displayName = string.Join(" ",
                new[] { staff.nombre, staff.apellido }
                .Where(x => !string.IsNullOrWhiteSpace(x)))
                .Trim();

            if (string.IsNullOrWhiteSpace(displayName))
                displayName = "Staff";

            return new StaffContextoDTO
            {
                id_staff = staff.id_staff,
                id_cuenta = staff.id_cuenta,
                nombre = staff.nombre,
                apellido = staff.apellido,
                display_name = displayName,
                eventos_disponibles = eventosDisponibles,
                access_token = jwt.token,
                expires_at_utc = jwt.expiresAtUtc
            };
        }

        public async Task<StaffListItemDTO> GetByIdAsync(long idCuenta, long idStaff)
        {
            var item = await (
                from s in _context.ef_staff.AsNoTracking()
                join r in _context.ef_roles.AsNoTracking() on s.id_rol equals r.id_rol
                where s.id_cuenta == idCuenta && s.id_staff == idStaff
                select new StaffListItemDTO
                {
                    id_staff = s.id_staff,
                    nombre = s.nombre,
                    apellido = s.apellido,
                    email = s.email,
                    telefono = s.telefono,
                    rol_codigo = r.codigo,
                    rol_descripcion = r.descripcion,
                    codigo = s.codigo,
                    activo = s.activo,
                    fecha_expiracion = s.fecha_expiracion,
                    usos = s.usos,
                    fecha_uso = s.fecha_uso
                }
            ).SingleOrDefaultAsync();

            if (item == null)
                throw new InvalidOperationException("Staff no encontrado en esta cuenta.");

            return item;
        }

        public async Task<StaffListItemDTO> UpdateStaffAsync(long idCuenta, long idStaff, API.DataSchema.DTO.Staff.StaffUpdateRequest req)
        {
            var staff = await _context.ef_staff
                .FirstOrDefaultAsync(x => x.id_staff == idStaff && x.id_cuenta == idCuenta);

            if (staff == null)
                throw new InvalidOperationException("Staff no encontrado en esta cuenta.");

            if (req.id_rol.HasValue)
            {
                var rol = await _context.ef_roles
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r =>
                        r.id_rol == req.id_rol.Value &&
                        r.activo &&
                        r.asignable_staff_operativo &&
                        r.permite_codigo_staff);

                if (rol == null)
                    throw new InvalidOperationException("Rol inválido para staff operativo.");

                staff.id_rol = req.id_rol.Value;
            }

            if (req.nombre != null)
                staff.nombre = string.IsNullOrWhiteSpace(req.nombre) ? null : req.nombre.Trim();

            if (req.apellido != null)
                staff.apellido = string.IsNullOrWhiteSpace(req.apellido) ? null : req.apellido.Trim();

            if (req.email != null)
                staff.email = string.IsNullOrWhiteSpace(req.email) ? null : req.email.Trim();

            if (req.telefono != null)
                staff.telefono = string.IsNullOrWhiteSpace(req.telefono) ? null : req.telefono.Trim();

            staff.fecha_expiracion = req.fecha_expiracion;

            if (req.activo.HasValue)
                staff.activo = req.activo.Value;

            staff.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(idCuenta, idStaff);
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
                new Claim("id_cuenta", staff.id_cuenta?.ToString() ?? ""),
                new Claim("id_evento", staff.id_evento?.ToString() ?? ""),
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

        public async Task<StaffCreadoDTO> RenovarCodigoAsync(long idCuenta, long idStaff, DateTimeOffset? fechaExpiracion)
        {
            var staff = await _context.ef_staff
                .FirstOrDefaultAsync(x => x.id_staff == idStaff && x.id_cuenta == idCuenta);

            if (staff == null)
                throw new InvalidOperationException("Staff inexistente para esta cuenta.");

            staff.fecha_expiracion = fechaExpiracion;
            staff.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new StaffCreadoDTO
            {
                id_staff = staff.id_staff,
                codigo = staff.codigo,
                nombre = staff.nombre,
                apellido = staff.apellido,
                fecha_expiracion = staff.fecha_expiracion
            };
        }
    }
}
