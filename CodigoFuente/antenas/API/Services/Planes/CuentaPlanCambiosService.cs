using API.DataSchema;
using API.DataSchema.DTO.Planes;
using API.Services.Precios;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public class CuentaPlanCambiosService : ICuentaPlanCambiosService
    {
        private readonly DataContext _context;
        private readonly IPreciosService _preciosService;

        public CuentaPlanCambiosService(DataContext context, IPreciosService preciosService)
        {
            _context = context;
            _preciosService = preciosService;
        }

        public async Task<CuentaCambioPlanDTO> SolicitarCambioPlanAsync(long id_cuenta, long id_usuario, SolicitarCambioPlanCuentaDTO req)
        {
            if (req == null)
                throw new Exception("Body inválido.");

            if (string.IsNullOrWhiteSpace(req.codigo_plan_solicitado))
                throw new Exception("Debe informar el plan solicitado.");

            req.codigo_plan_solicitado = req.codigo_plan_solicitado.Trim().ToUpperInvariant();

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == id_cuenta);

            if (cuenta == null)
                throw new Exception("Cuenta inexistente.");

            bool esAdminCuenta = await (
                from cu in _context.ef_cuenta_usuarios
                join r in _context.ef_roles on cu.id_rol equals r.id_rol
                where cu.id_cuenta == id_cuenta
                   && cu.id_usuario == id_usuario
                   && cu.activo
                   && r.codigo == "ACCOUNT_ADMIN"
                select cu.id_cuenta_usuario
            ).AnyAsync();

            if (!esAdminCuenta)
                throw new Exception("No tenés permiso para solicitar cambio de plan en esta cuenta.");

            if (!cuenta.id_plan.HasValue)
                throw new Exception("La cuenta no tiene plan actual asignado.");

            bool yaTienePendiente = await _context.ef_cuenta_plan_cambios
                .AnyAsync(x => x.id_cuenta == id_cuenta && x.estado == "PENDIENTE" && x.activo);

            if (yaTienePendiente)
                throw new Exception("Esta cuenta ya tiene una solicitud de cambio de plan pendiente.");

            var planActual = await _context.ef_planes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_plan == cuenta.id_plan.Value);

            if (planActual == null)
                throw new Exception("No se encontró el plan actual de la cuenta.");

            var planSolicitado = await _context.ef_planes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo == req.codigo_plan_solicitado);

            if (planSolicitado == null)
                throw new Exception("No se encontró el plan solicitado.");

            if (planSolicitado.tipo != "B2B")
                throw new Exception("Solo se puede solicitar cambio a planes B2B desde una cuenta.");

            if (planActual.tipo != "B2B")
                throw new Exception("El plan actual de la cuenta no es B2B.");

            if (planSolicitado.id_plan == planActual.id_plan)
                throw new Exception("La cuenta ya tiene ese plan.");

            var mercadoMoneda = await ResolverMercadoMonedaCuentaAsync(cuenta);

            var precioActual = await _preciosService.GetPrecioPlanAsync(
                planActual.codigo,
                mercadoMoneda.codigo_mercado
            );

            var precioSolicitado = await _preciosService.GetPrecioPlanAsync(
                planSolicitado.codigo,
                mercadoMoneda.codigo_mercado
            );

            decimal diferenciaBase = precioSolicitado.precio_publicado - precioActual.precio_publicado;
            if (diferenciaBase < 0)
                diferenciaBase = 0;

            var now = DateTimeOffset.UtcNow;

            var cambio = new ef_cuenta_plan_cambios
            {
                id_cuenta = id_cuenta,
                id_plan_actual = planActual.id_plan,
                id_plan_solicitado = planSolicitado.id_plan,

                estado = "PENDIENTE",

                codigo_mercado = mercadoMoneda.codigo_mercado,
                codigo_moneda = mercadoMoneda.codigo_moneda,

                precio_plan_actual_reconocido = precioActual.precio_publicado,
                precio_plan_solicitado_lista = precioSolicitado.precio_lista,
                precio_plan_solicitado_publicado = precioSolicitado.precio_publicado,

                diferencia_base = diferenciaBase,
                total_a_cobrar = diferenciaBase,

                motivo_solicitud = req.motivo_solicitud,
                id_usuario_solicita = id_usuario,

                fecha_solicitud = now,
                fecha_alta = now,
                activo = true
            };

            _context.ef_cuenta_plan_cambios.Add(cambio);
            await _context.SaveChangesAsync();

            return await GetByIdInternoAsync(cambio.id_cuenta_plan_cambio);
        }

        public async Task<CuentaCambioPlanDTO?> GetPendienteCuentaAsync(long id_cuenta, long id_usuario)
        {
            bool tieneAcceso = await (
                from cu in _context.ef_cuenta_usuarios
                join r in _context.ef_roles on cu.id_rol equals r.id_rol
                where cu.id_cuenta == id_cuenta
                   && cu.id_usuario == id_usuario
                   && cu.activo
                   && (r.codigo == "ACCOUNT_ADMIN" || r.codigo == "ACCOUNT_STAFF")
                select cu.id_cuenta_usuario
            ).AnyAsync();

            if (!tieneAcceso)
                throw new Exception("No tenés permiso para consultar esta cuenta.");

            return await GetQuery()
                .Where(x => x.id_cuenta == id_cuenta && x.estado == "PENDIENTE")
                .FirstOrDefaultAsync();
        }

        private async Task<(string codigo_mercado, string codigo_moneda)> ResolverMercadoMonedaCuentaAsync(ef_cuentas cuenta)
        {
            var mercadoPais = await _context.ef_mercado_paises
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_pais == cuenta.id_pais && x.activo);

            if (mercadoPais == null)
                throw new Exception("No se encontró mercado comercial para el país de la cuenta.");

            var mercado = await _context.ef_mercados
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo_mercado == mercadoPais.codigo_mercado && x.activo);

            if (mercado == null)
                throw new Exception("El mercado comercial no existe o no está activo.");

            string codigoMoneda =
                !string.IsNullOrWhiteSpace(cuenta.moneda_default)
                ? cuenta.moneda_default.Trim().ToUpperInvariant()
                : mercado.codigo_moneda_default;

            return (mercado.codigo_mercado, codigoMoneda);
        }

        private async Task<CuentaCambioPlanDTO> GetByIdInternoAsync(long id_cuenta_plan_cambio)
        {
            var item = await GetQuery()
                .FirstOrDefaultAsync(x => x.id_cuenta_plan_cambio == id_cuenta_plan_cambio);

            if (item == null)
                throw new Exception("Solicitud inexistente.");

            return item;
        }

        private IQueryable<CuentaCambioPlanDTO> GetQuery()
        {
            return
                from c in _context.ef_cuenta_plan_cambios.AsNoTracking()
                join cuenta in _context.ef_cuentas.AsNoTracking()
                    on c.id_cuenta equals cuenta.id_cuenta
                join pa in _context.ef_planes.AsNoTracking()
                    on c.id_plan_actual equals pa.id_plan
                join ps in _context.ef_planes.AsNoTracking()
                    on c.id_plan_solicitado equals ps.id_plan
                select new CuentaCambioPlanDTO
                {
                    id_cuenta_plan_cambio = c.id_cuenta_plan_cambio,
                    id_cuenta = c.id_cuenta,
                    cuenta_nombre = cuenta.nombre_cuenta,

                    plan_actual_codigo = pa.codigo,
                    plan_actual_nombre = pa.nombre,

                    plan_solicitado_codigo = ps.codigo,
                    plan_solicitado_nombre = ps.nombre,

                    estado = c.estado,

                    codigo_mercado = c.codigo_mercado,
                    codigo_moneda = c.codigo_moneda,

                    precio_plan_actual_reconocido = c.precio_plan_actual_reconocido,
                    precio_plan_solicitado_lista = c.precio_plan_solicitado_lista,
                    precio_plan_solicitado_publicado = c.precio_plan_solicitado_publicado,
                    diferencia_base = c.diferencia_base,

                    tipo_ajuste = c.tipo_ajuste,
                    importe_ajuste = c.importe_ajuste,
                    motivo_ajuste = c.motivo_ajuste,
                    descripcion_ajuste = c.descripcion_ajuste,

                    total_a_cobrar = c.total_a_cobrar,

                    motivo_solicitud = c.motivo_solicitud,
                    observacion_admin = c.observacion_admin,

                    id_usuario_solicita = c.id_usuario_solicita,
                    fecha_solicitud = c.fecha_solicitud
                };
        }
    }
}