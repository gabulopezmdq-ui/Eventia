using API.DataSchema;
using API.DataSchema.DTO;
using API.DataSchema.DTO.Cuentas;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public class CuentasService : ICuentasService
    {
        private readonly DataContext _context;
        private readonly ICuentaContextService _cuentaContextService;

        public CuentasService(DataContext context, ICuentaContextService cuentaContextService)
        {
            _context = context;
            _cuentaContextService = cuentaContextService;
        }

        public async Task<CuentaResponseDTO> GetMiCuentaAsync(long id_usuario)
        {
            var id_cuenta = await _cuentaContextService.GetCuentaIdActualAsync(id_usuario);

            var cuenta = await _context.ef_cuentas
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_cuenta == id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("No se encontró la cuenta.");

            return MapCuenta(cuenta);
        }

        public async Task<CuentaResponseDTO> UpdateMiCuentaAsync(long id_usuario, CuentaUpdateRequestDTO request)
        {
            var id_cuenta = await _cuentaContextService.GetCuentaIdActualAsync(id_usuario);

            var esAdmin = await _cuentaContextService.EsAdminCuentaAsync(id_usuario, id_cuenta);
            if (!esAdmin)
                throw new UnauthorizedAccessException("Solo ACCOUNT_ADMIN puede editar la cuenta.");

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("No se encontró la cuenta.");

            ValidarCuentaRequest(request.nombre_cuenta, request.tipo, request.id_pais, request.id_tipo_identificacion_fiscal, request.identificacion_fiscal);

            var tipo = request.tipo.Trim().ToUpper();

            if (tipo != "SALON" && tipo != "PLANNER" && tipo != "EMPRESA")
                throw new InvalidOperationException("El tipo de cuenta es inválido.");

            await ValidarPaisYTipoFiscalAsync(request.id_pais, request.id_tipo_identificacion_fiscal);

            if (!string.Equals(cuenta.nombre_cuenta, request.nombre_cuenta?.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                var existeNombre = await _context.ef_cuentas
                    .AsNoTracking()
                    .AnyAsync(x => x.nombre_cuenta == request.nombre_cuenta.Trim() && x.id_cuenta != cuenta.id_cuenta);

                if (existeNombre)
                    throw new InvalidOperationException("Ya existe una cuenta con ese nombre.");
            }

            cuenta.nombre_cuenta = request.nombre_cuenta.Trim();
            cuenta.tipo = tipo;
            cuenta.instagram = NormalizarTexto(request.instagram);
            cuenta.web = NormalizarTexto(request.web);
            cuenta.telefono = NormalizarTexto(request.telefono);
            cuenta.ciudad = NormalizarTexto(request.ciudad);
            cuenta.id_pais = request.id_pais.Value;
            cuenta.id_tipo_identificacion_fiscal = request.id_tipo_identificacion_fiscal;
            cuenta.identificacion_fiscal = NormalizarTexto(request.identificacion_fiscal);
            cuenta.descripcion = NormalizarTexto(request.descripcion);
            cuenta.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return MapCuenta(cuenta);
        }

        public async Task<cuenta_solicitar_response> SolicitarCuentaAsync(long id_usuario, cuenta_solicitar_request request)
        {
            ValidarCuentaRequest(request.nombre_cuenta, request.tipo, request.id_pais, request.id_tipo_identificacion_fiscal, request.identificacion_fiscal);

            var yaTieneCuenta = await _context.ef_cuenta_usuarios
                .AsNoTracking()
                .AnyAsync(x => x.id_usuario == id_usuario);

            if (yaTieneCuenta)
                throw new InvalidOperationException("El usuario ya tiene una cuenta asociada o una solicitud en curso.");

            var tipo = request.tipo.Trim().ToUpper();

            if (tipo != "SALON" && tipo != "PLANNER" && tipo != "EMPRESA")
                throw new InvalidOperationException("El tipo de cuenta es inválido.");

            await ValidarPaisYTipoFiscalAsync(request.id_pais, request.id_tipo_identificacion_fiscal);

            var existeNombre = await _context.ef_cuentas
                .AsNoTracking()
                .AnyAsync(x => x.nombre_cuenta == request.nombre_cuenta.Trim());

            if (existeNombre)
                throw new InvalidOperationException("Ya existe una cuenta con ese nombre.");

            var idRolAccountAdmin = await _context.ef_roles
                .AsNoTracking()
                .Where(x => x.codigo == "ACCOUNT_ADMIN" && x.activo)
                .Select(x => (short?)x.id_rol)
                .FirstOrDefaultAsync();

            if (!idRolAccountAdmin.HasValue)
                throw new InvalidOperationException("No existe el rol ACCOUNT_ADMIN.");

            var cuenta = new ef_cuentas
            {
                nombre_cuenta = request.nombre_cuenta.Trim(),
                tipo = tipo,
                estado = "P",
                id_plan = null,
                instagram = NormalizarTexto(request.instagram),
                web = NormalizarTexto(request.web),
                telefono = NormalizarTexto(request.telefono),
                ciudad = NormalizarTexto(request.ciudad),
                id_pais = request.id_pais.Value,
                id_tipo_identificacion_fiscal = request.id_tipo_identificacion_fiscal,
                identificacion_fiscal = NormalizarTexto(request.identificacion_fiscal),
                descripcion = NormalizarTexto(request.descripcion),
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_cuentas.Add(cuenta);
            await _context.SaveChangesAsync();

            var cuentaUsuario = new ef_cuenta_usuarios
            {
                id_cuenta = cuenta.id_cuenta,
                id_usuario = id_usuario,
                id_rol = idRolAccountAdmin.Value,
                activo = false,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.ef_cuenta_usuarios.Add(cuentaUsuario);
            await _context.SaveChangesAsync();

            return new cuenta_solicitar_response
            {
                ok = true,
                mensaje = "Recibimos tu solicitud. Te avisaremos cuando tu cuenta esté habilitada.",
                id_cuenta = cuenta.id_cuenta,
                estado = cuenta.estado
            };
        }

        private async Task ValidarPaisYTipoFiscalAsync(short? id_pais, short? id_tipo_identificacion_fiscal)
        {
            if (id_pais.HasValue)
            {
                var existePais = await _context.ef_paises
                    .AsNoTracking()
                    .AnyAsync(x => x.id_pais == id_pais.Value && x.activo);

                if (!existePais)
                    throw new InvalidOperationException("El país seleccionado no existe o está inactivo.");
            }

            if (id_tipo_identificacion_fiscal.HasValue)
            {
                var tipoFiscal = await _context.ef_tipos_identificacion_fiscal
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.id_tipo_identificacion_fiscal == id_tipo_identificacion_fiscal.Value && x.activo);

                if (tipoFiscal == null)
                    throw new InvalidOperationException("El tipo de identificación fiscal seleccionado no existe o está inactivo.");

                if (!id_pais.HasValue)
                    throw new InvalidOperationException("Debe seleccionar un país para informar el tipo de identificación fiscal.");

                if (tipoFiscal.id_pais != id_pais.Value)
                    throw new InvalidOperationException("El tipo de identificación fiscal no corresponde al país seleccionado.");
            }
        }

        private void ValidarCuentaRequest(
            string nombre_cuenta,
            string tipo,
            short? id_pais,
            short? id_tipo_identificacion_fiscal,
            string identificacion_fiscal)
        {
            if (string.IsNullOrWhiteSpace(nombre_cuenta))
                throw new InvalidOperationException("El nombre de la cuenta es obligatorio.");

            if (string.IsNullOrWhiteSpace(tipo))
                throw new InvalidOperationException("El tipo de cuenta es obligatorio.");

            if (id_tipo_identificacion_fiscal.HasValue && string.IsNullOrWhiteSpace(identificacion_fiscal))
                throw new InvalidOperationException("Debe informar la identificación fiscal.");

            if (!id_tipo_identificacion_fiscal.HasValue && !string.IsNullOrWhiteSpace(identificacion_fiscal))
                throw new InvalidOperationException("Debe seleccionar el tipo de identificación fiscal.");

            if (id_tipo_identificacion_fiscal.HasValue && !id_pais.HasValue)
                throw new InvalidOperationException("Debe seleccionar un país.");

            if (!id_pais.HasValue)
                throw new InvalidOperationException("El país de la cuenta es obligatorio.");
        }

        private static string NormalizarTexto(string valor)
        {
            return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
        }

        private static CuentaResponseDTO MapCuenta(ef_cuentas cuenta)
        {
            return new CuentaResponseDTO
            {
                id_cuenta = cuenta.id_cuenta,
                nombre_cuenta = cuenta.nombre_cuenta,
                tipo = cuenta.tipo,
                estado = cuenta.estado,
                id_plan = cuenta.id_plan,
                instagram = cuenta.instagram,
                web = cuenta.web,
                telefono = cuenta.telefono,
                ciudad = cuenta.ciudad,
                id_pais = cuenta.id_pais,
                id_tipo_identificacion_fiscal = cuenta.id_tipo_identificacion_fiscal,
                identificacion_fiscal = cuenta.identificacion_fiscal,
                descripcion = cuenta.descripcion,
                fecha_alta = cuenta.fecha_alta,
                fecha_modif = cuenta.fecha_modif
            };
        }
    }
}