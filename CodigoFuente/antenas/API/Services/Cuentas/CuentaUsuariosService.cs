using API.DataSchema;
using API.DataSchema.DTO.Cuentas;
using API.Utility;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public class CuentaUsuariosService : ICuentaUsuariosService
    {
        private readonly DataContext _context;
        private readonly ICuentaContextService _cuentaContext;
        private readonly IConfiguration _config;

        public CuentaUsuariosService(
            DataContext context,
            ICuentaContextService cuentaContext,
            IConfiguration config)
        {
            _context = context;
            _cuentaContext = cuentaContext;
            _config = config;
        }

        public async Task<CuentaUsuarioInvitarResponseDTO> InvitarAsync(
            long id_usuario_invita,
            long id_cuenta,
            CuentaUsuarioInvitarRequestDTO request)
        {
            if (id_cuenta <= 0)
                throw new InvalidOperationException("Cuenta inválida.");

            if (request == null)
                throw new InvalidOperationException("Body inválido.");

            if (string.IsNullOrWhiteSpace(request.email))
                throw new InvalidOperationException("El email es obligatorio.");

            if (string.IsNullOrWhiteSpace(request.rol_codigo))
                throw new InvalidOperationException("El rol es obligatorio.");

            var email = request.email.Trim().ToLower();
            var rolCodigo = request.rol_codigo.Trim().ToUpper();

            // Solo roles permitidos
            if (rolCodigo != "ACCOUNT_ADMIN" &&
                rolCodigo != "ACCOUNT_STAFF")
            {
                throw new InvalidOperationException("Rol inválido.");
            }


            // Seguridad: solo admin cuenta
            var esAdmin =
                await _cuentaContext.EsAdminCuentaAsync(
                    id_usuario_invita,
                    id_cuenta);

            if (!esAdmin)
                throw new UnauthorizedAccessException(
                    "Solo ACCOUNT_ADMIN puede invitar usuarios.");

            // Obtener rol
            var rol = await _context.ef_roles
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.codigo == rolCodigo &&
                    x.activo);

            if (rol == null)
                throw new InvalidOperationException(
                    "El rol no existe.");

            // ¿Ya existe usuario con ese mail?
            var usuarioExistente = await _context.ef_usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.email.ToLower() == email);

            // Si existe, verificar que no pertenezca ya
            if (usuarioExistente != null)
            {
                var yaPertenece =
                    await _context.ef_cuenta_usuarios
                    .AsNoTracking()
                    .AnyAsync(x =>
                        x.id_cuenta == id_cuenta &&
                        x.id_usuario == usuarioExistente.id_usuario &&
                        x.activo);

                if (yaPertenece)
                    throw new InvalidOperationException(
                        "El usuario ya pertenece a la cuenta.");
            }

            // Cancelar invitaciones pendientes previas
            var pendientes =
                await _context.ef_cuenta_usuario_invitaciones
                .Where(x =>
                    x.id_cuenta == id_cuenta &&
                    x.email_invitado.ToLower() == email &&
                    x.estado == "P" &&
                    x.activo)
                .ToListAsync();

            foreach (var inv in pendientes)
            {
                inv.estado = "C";
                inv.fecha_modif = DateTimeOffset.UtcNow;
            }

            var token = TokenUtility.Generate(64);

            var invitacion =
                new ef_cuenta_usuario_invitaciones
                {
                    id_cuenta = id_cuenta,
                    email_invitado = email,
                    id_rol = rol.id_rol,
                    token = token,
                    estado = "P",
                    fecha_expiracion = DateTimeOffset.UtcNow.AddDays(15),
                    id_usuario_invita = id_usuario_invita,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };

            _context.ef_cuenta_usuario_invitaciones
                .Add(invitacion);

            await _context.SaveChangesAsync();

            // Front login normal
            var frontendUrl =
                _config["Frontend:BaseUrl"]
                ?? "https://eventiaapp.vercel.app";

            var url =
                $"{frontendUrl}/login?invite=account&token={token}";

            return new CuentaUsuarioInvitarResponseDTO
            {
                ok = true,
                url_invitacion = url,
                email_invitado = email,
                rol_codigo = rolCodigo
            };
        }

        public async Task<CuentaUsuarioValidarInvitacionResponseDTO> ValidarInvitacionAsync(string token)
        {
            token = token?.Trim();

            if (string.IsNullOrWhiteSpace(token))
            {
                return new CuentaUsuarioValidarInvitacionResponseDTO
                {
                    valida = false,
                    mensaje = "Token inválido."
                };
            }

            var invitacion = await (
                from inv in _context.ef_cuenta_usuario_invitaciones.AsNoTracking()
                join c in _context.ef_cuentas.AsNoTracking()
                    on inv.id_cuenta equals c.id_cuenta
                join r in _context.ef_roles.AsNoTracking()
                    on inv.id_rol equals r.id_rol
                where inv.token == token
                select new
                {
                    inv.id_cuenta_usuario_invitacion,
                    inv.email_invitado,
                    inv.estado,
                    inv.activo,
                    inv.fecha_expiracion,
                    c.nombre_cuenta,
                    cuenta_estado = c.estado,
                    rol_codigo = r.codigo
                }
            ).FirstOrDefaultAsync();

            if (invitacion == null)
            {
                return new CuentaUsuarioValidarInvitacionResponseDTO
                {
                    valida = false,
                    mensaje = "La invitación no existe."
                };
            }

            if (!invitacion.activo)
            {
                return new CuentaUsuarioValidarInvitacionResponseDTO
                {
                    valida = false,
                    mensaje = "La invitación no está activa."
                };
            }

            if (invitacion.estado != "P")
            {
                return new CuentaUsuarioValidarInvitacionResponseDTO
                {
                    valida = false,
                    mensaje = "La invitación ya no está pendiente."
                };
            }

            if (invitacion.fecha_expiracion.HasValue &&
                invitacion.fecha_expiracion.Value < DateTimeOffset.UtcNow)
            {
                return new CuentaUsuarioValidarInvitacionResponseDTO
                {
                    valida = false,
                    mensaje = "La invitación está vencida."
                };
            }

            if (invitacion.cuenta_estado != "A")
            {
                return new CuentaUsuarioValidarInvitacionResponseDTO
                {
                    valida = false,
                    mensaje = "La cuenta no está activa."
                };
            }

            return new CuentaUsuarioValidarInvitacionResponseDTO
            {
                valida = true,
                mensaje = "Invitación válida.",
                nombre_cuenta = invitacion.nombre_cuenta,
                email_invitado = invitacion.email_invitado,
                rol_codigo = invitacion.rol_codigo
            };
        }

        public async Task<CuentaUsuarioAceptarInvitacionResponseDTO> AceptarInvitacionAsync(
            long id_usuario_acepta,
            string token)
        {
            token = token?.Trim();

            if (string.IsNullOrWhiteSpace(token))
                throw new InvalidOperationException("Token inválido.");

            var invitacion = await _context.ef_cuenta_usuario_invitaciones
                .FirstOrDefaultAsync(x => x.token == token);

            if (invitacion == null)
                throw new InvalidOperationException("La invitación no existe.");

            if (!invitacion.activo)
                throw new InvalidOperationException("La invitación no está activa.");

            if (invitacion.estado != "P")
                throw new InvalidOperationException("La invitación ya no está pendiente.");

            if (invitacion.fecha_expiracion.HasValue &&
                invitacion.fecha_expiracion.Value < DateTimeOffset.UtcNow)
            {
                invitacion.estado = "V";
                invitacion.fecha_modif = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();

                throw new InvalidOperationException("La invitación está vencida.");
            }

            var cuenta = await _context.ef_cuentas
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_cuenta == invitacion.id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("La cuenta no existe.");

            if (cuenta.estado != "A")
                throw new InvalidOperationException("La cuenta no está activa.");

            var usuario = await _context.ef_usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_usuario == id_usuario_acepta);

            if (usuario == null)
                throw new InvalidOperationException("Usuario inexistente.");

            var emailUsuario = usuario.email?.Trim().ToLower();
            var emailInvitado = invitacion.email_invitado.Trim().ToLower();

            if (emailUsuario != emailInvitado)
            {
                throw new InvalidOperationException(
                    "Esta invitación fue emitida para " + invitacion.email_invitado +
                    ". Iniciá sesión con ese email o pedí una nueva invitación.");
            }

            var yaExiste = await _context.ef_cuenta_usuarios
                .AnyAsync(x =>
                    x.id_cuenta == invitacion.id_cuenta &&
                    x.id_usuario == id_usuario_acepta &&
                    x.id_rol == invitacion.id_rol);

            if (!yaExiste)
            {
                var cuentaUsuario = new ef_cuenta_usuarios
                {
                    id_cuenta = invitacion.id_cuenta,
                    id_usuario = id_usuario_acepta,
                    id_rol = invitacion.id_rol,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.ef_cuenta_usuarios.Add(cuentaUsuario);
            }
            else
            {
                var vinculo = await _context.ef_cuenta_usuarios
                    .FirstOrDefaultAsync(x =>
                        x.id_cuenta == invitacion.id_cuenta &&
                        x.id_usuario == id_usuario_acepta &&
                        x.id_rol == invitacion.id_rol);

                if (vinculo == null)
                    throw new InvalidOperationException("No se pudo recuperar el vínculo existente.");

                vinculo.activo = true;
            }

            invitacion.estado = "A";
            invitacion.fecha_aceptacion = DateTimeOffset.UtcNow;
            invitacion.fecha_modif = DateTimeOffset.UtcNow;
            invitacion.id_usuario_acepta = id_usuario_acepta;

            await _context.SaveChangesAsync();

            var rolCodigo = await _context.ef_roles
                .AsNoTracking()
                .Where(x => x.id_rol == invitacion.id_rol)
                .Select(x => x.codigo)
                .FirstOrDefaultAsync();

            return new CuentaUsuarioAceptarInvitacionResponseDTO
            {
                ok = true,
                mensaje = "Invitación aceptada correctamente.",
                id_cuenta = cuenta.id_cuenta,
                nombre_cuenta = cuenta.nombre_cuenta,
                rol_codigo = rolCodigo ?? ""
            };
        }

        public async Task<CuentaUsuarioOperacionResponseDTO> CambiarRolAsync(
            long id_usuario_admin,
            long id_cuenta,
            CuentaUsuarioCambiarRolRequestDTO request)
        {
            if (request == null)
                throw new InvalidOperationException("Body inválido.");

            if (id_cuenta <= 0)
                throw new InvalidOperationException("Cuenta inválida.");

            if (request.id_cuenta_usuario <= 0)
                throw new InvalidOperationException("Usuario de cuenta inválido.");

            if (string.IsNullOrWhiteSpace(request.rol_codigo))
                throw new InvalidOperationException("El rol es obligatorio.");

            var esAdmin = await _cuentaContext.EsAdminCuentaAsync(id_usuario_admin, id_cuenta);
            if (!esAdmin)
                throw new UnauthorizedAccessException("Solo ACCOUNT_ADMIN puede cambiar roles.");

            var nuevoRolCodigo = request.rol_codigo.Trim().ToUpper();

            if (nuevoRolCodigo != "ACCOUNT_ADMIN" && nuevoRolCodigo != "ACCOUNT_STAFF")
                throw new InvalidOperationException("Rol inválido.");

            var nuevoRol = await _context.ef_roles
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo == nuevoRolCodigo && x.activo);

            if (nuevoRol == null)
                throw new InvalidOperationException("El rol no existe.");

            var vinculo = await _context.ef_cuenta_usuarios
                .FirstOrDefaultAsync(x =>
                    x.id_cuenta_usuario == request.id_cuenta_usuario &&
                    x.id_cuenta == id_cuenta);

            if (vinculo == null)
                throw new InvalidOperationException("El usuario no pertenece a esta cuenta.");

            if (vinculo.id_usuario == id_usuario_admin && nuevoRolCodigo != "ACCOUNT_ADMIN")
                throw new InvalidOperationException("No podés quitarte tu propio rol de administrador.");

            var yaExisteMismoRol = await _context.ef_cuenta_usuarios
                .AnyAsync(x =>
                    x.id_cuenta == id_cuenta &&
                    x.id_usuario == vinculo.id_usuario &&
                    x.id_rol == nuevoRol.id_rol &&
                    x.id_cuenta_usuario != vinculo.id_cuenta_usuario);

            if (yaExisteMismoRol)
                throw new InvalidOperationException("El usuario ya tiene ese rol en la cuenta.");

            var rolActual = await _context.ef_roles
                .AsNoTracking()
                .Where(x => x.id_rol == vinculo.id_rol)
                .Select(x => x.codigo)
                .FirstOrDefaultAsync();

            if (rolActual == "ACCOUNT_ADMIN" && nuevoRolCodigo != "ACCOUNT_ADMIN")
                await ValidarNoDejarCuentaSinAdminAsync(id_cuenta, vinculo.id_usuario);

            vinculo.id_rol = nuevoRol.id_rol;

            await _context.SaveChangesAsync();

            return new CuentaUsuarioOperacionResponseDTO
            {
                ok = true,
                mensaje = "Rol actualizado correctamente."
            };
        }

        public async Task<CuentaUsuarioOperacionResponseDTO> SetActivoAsync(
            long id_usuario_admin,
            long id_cuenta,
            long id_cuenta_usuario,
            bool activo)
        {
            if (id_cuenta_usuario <= 0)
                throw new InvalidOperationException("Usuario de cuenta inválido.");

            if (id_cuenta <= 0)
                throw new InvalidOperationException("Cuenta inválida.");

            var esAdmin = await _cuentaContext.EsAdminCuentaAsync(id_usuario_admin, id_cuenta);
            if (!esAdmin)
                throw new UnauthorizedAccessException("Solo ACCOUNT_ADMIN puede activar o desactivar usuarios.");

            var vinculo = await _context.ef_cuenta_usuarios
                .FirstOrDefaultAsync(x =>
                    x.id_cuenta_usuario == id_cuenta_usuario &&
                    x.id_cuenta == id_cuenta);

            if (vinculo == null)
                throw new InvalidOperationException("El usuario no pertenece a esta cuenta.");

            if (vinculo.id_usuario == id_usuario_admin && activo == false)
                throw new InvalidOperationException("No podés desactivarte a vos misma de la cuenta.");

            var rolActual = await _context.ef_roles
                .AsNoTracking()
                .Where(x => x.id_rol == vinculo.id_rol)
                .Select(x => x.codigo)
                .FirstOrDefaultAsync();

            if (rolActual == "ACCOUNT_ADMIN" && activo == false)
                await ValidarNoDejarCuentaSinAdminAsync(id_cuenta, vinculo.id_usuario);

            vinculo.activo = activo;

            await _context.SaveChangesAsync();

            return new CuentaUsuarioOperacionResponseDTO
            {
                ok = true,
                mensaje = activo
                    ? "Usuario activado correctamente."
                    : "Usuario desactivado correctamente."
            };
        }

        private async Task ValidarNoDejarCuentaSinAdminAsync(long id_cuenta, long id_usuario_afectado)
        {
            var idRolAdmin = await _context.ef_roles
                .AsNoTracking()
                .Where(x => x.codigo == "ACCOUNT_ADMIN" && x.activo)
                .Select(x => x.id_rol)
                .FirstOrDefaultAsync();

            if (idRolAdmin == 0)
                throw new InvalidOperationException("No existe el rol ACCOUNT_ADMIN.");

            var otrosAdminsActivos = await _context.ef_cuenta_usuarios
                .AsNoTracking()
                .AnyAsync(x =>
                    x.id_cuenta == id_cuenta &&
                    x.id_usuario != id_usuario_afectado &&
                    x.id_rol == idRolAdmin &&
                    x.activo);

            if (!otrosAdminsActivos)
                throw new InvalidOperationException("La cuenta debe tener al menos un ACCOUNT_ADMIN activo.");
        }



    }
}