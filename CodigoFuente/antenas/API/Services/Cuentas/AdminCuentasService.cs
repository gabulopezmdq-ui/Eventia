using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Cuentas
{
    public class AdminCuentasService : IAdminCuentasService
    {
        private readonly DataContext _context;

        public AdminCuentasService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<admin_cuenta_admin_dto>> GetAllAsync(string estado = null)
        {
            var query = _context.ef_cuentas
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(estado))
            {
                estado = estado.Trim().ToUpper();
                query = query.Where(c => c.estado == estado);
            }

            var result = await query
                .OrderBy(c => c.nombre_cuenta)
                .Select(c => new admin_cuenta_admin_dto
                {
                    id_cuenta = c.id_cuenta,
                    nombre_cuenta = c.nombre_cuenta,
                    tipo = c.tipo,
                    estado = c.estado,

                    id_plan = c.id_plan,
                    plan_codigo = c.plan != null ? c.plan.codigo : null,
                    plan_nombre = c.plan != null ? c.plan.nombre : null,

                    instagram = c.instagram,
                    web = c.web,
                    telefono = c.telefono,
                    ciudad = c.ciudad,

                    id_pais = c.id_pais,
                    pais_codigo_iso2 = c.pais != null ? c.pais.codigo_iso2 : null,
                    pais_codigo_iso3 = c.pais != null ? c.pais.codigo_iso3 : null,

                    id_tipo_identificacion_fiscal = c.id_tipo_identificacion_fiscal,
                    tipo_identificacion_fiscal_codigo = c.tipo_identificacion_fiscal != null
                        ? c.tipo_identificacion_fiscal.codigo
                        : null,

                    identificacion_fiscal = c.identificacion_fiscal,
                    descripcion = c.descripcion,
                    moneda_default = c.moneda_default,

                    fecha_alta = c.fecha_alta,
                    fecha_modif = c.fecha_modif
                })
                .ToListAsync();

            return result;
        }

        public async Task<List<admin_cuenta_pendiente_dto>> GetPendientesAsync()
        {
            var result = await (
                from cu in _context.ef_cuenta_usuarios.AsNoTracking()
                join c in _context.ef_cuentas.AsNoTracking() on cu.id_cuenta equals c.id_cuenta
                join r in _context.ef_roles.AsNoTracking() on cu.id_rol equals r.id_rol
                join u in _context.ef_usuarios.AsNoTracking() on cu.id_usuario equals u.id_usuario
                where c.estado == "P"
                      && r.codigo == "ACCOUNT_ADMIN"
                orderby c.fecha_alta
                select new admin_cuenta_pendiente_dto
                {
                    id_cuenta = c.id_cuenta,
                    nombre_cuenta = c.nombre_cuenta,
                    tipo = c.tipo,
                    estado = c.estado,
                    id_usuario_owner = u.id_usuario,
                    email_owner = u.email,
                    fecha_alta = c.fecha_alta
                }
            ).ToListAsync();

            return result;
        }

        public async Task<admin_aprobar_cuenta_response> AprobarAsync(admin_aprobar_cuenta_request request, long id_usuario_admin)
        {
            var now = DateTimeOffset.UtcNow;

            var cuenta = await _context.Set<ef_cuentas>()
                .SingleOrDefaultAsync(c => c.id_cuenta == request.id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("Cuenta inexistente.");

            var plan = await _context.Set<ef_planes>()
                .SingleOrDefaultAsync(p => p.codigo == request.codigo_plan && p.activo == true && p.tipo == "B2B");

            if (plan == null)
                throw new InvalidOperationException("Plan B2B inexistente o inactivo.");

            await using var tx = await _context.Database.BeginTransactionAsync();

            // 1) Activar cuenta + asignar plan
            cuenta.estado = "A";
            cuenta.id_plan = plan.id_plan;
            cuenta.fecha_modif = now;

            // 2) (opcional recomendado) activar owner en ef_cuenta_usuarios si tu doc lo pide
            //    ... (tu lógica actual)

            // 3) Cerrar suscripciones CUENTA previas (si existieran)
            await CerrarSuscripcionesCuentaActivasAsync(cuenta.id_cuenta, now);

            // 4) Crear suscripción CUENTA ACTIVA con end real
            CrearSuscripcionCuentaActiva(cuenta.id_cuenta, plan, now);

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return new admin_aprobar_cuenta_response
            {
                ok = true,
                id_cuenta = cuenta.id_cuenta,
                estado = cuenta.estado,
                codigo_plan = plan.codigo
                // agregá campos si tu response los tiene
            };
        }

        public async Task<admin_suspender_cuenta_response> SuspenderAsync(admin_suspender_cuenta_request request, long id_usuario_admin)
        {
            if (request.id_cuenta <= 0)
                throw new InvalidOperationException("Debe informar la cuenta.");

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == request.id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("La cuenta no existe.");

            cuenta.estado = "S";
            cuenta.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return new admin_suspender_cuenta_response
            {
                ok = true,
                id_cuenta = cuenta.id_cuenta,
                estado = cuenta.estado
            };
        }

        public async Task<admin_cambiar_plan_response> CambiarPlanAsync(admin_cambiar_plan_request request, long id_usuario_admin)
        {
            if (request == null)
                throw new InvalidOperationException("Request inválido.");

            if (request.id_cuenta <= 0)
                throw new InvalidOperationException("id_cuenta inválido.");

            if (string.IsNullOrWhiteSpace(request.codigo_plan_nuevo))
                throw new InvalidOperationException("codigo_plan_nuevo es obligatorio.");

            var now = DateTimeOffset.UtcNow;

            var cuenta = await _context.Set<ef_cuentas>()
                .SingleOrDefaultAsync(c => c.id_cuenta == request.id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("Cuenta inexistente.");

            // Solo si querés permitir cambiar plan en cuentas activas:
            if (cuenta.estado != "A")
                throw new InvalidOperationException("Solo se puede cambiar plan si la cuenta está Activa (estado = A).");

            // Plan anterior (por id_plan actual)
            string? codigoPlanAnterior = null;
            if (cuenta.id_plan.HasValue)
            {
                codigoPlanAnterior = await _context.Set<ef_planes>()
                    .Where(p => p.id_plan == cuenta.id_plan.Value)
                    .Select(p => p.codigo)
                    .FirstOrDefaultAsync();
            }

            // Plan nuevo por código
            var planNuevo = await _context.Set<ef_planes>()
                .SingleOrDefaultAsync(p =>
                    p.codigo == request.codigo_plan_nuevo &&
                    p.activo == true &&
                    p.tipo == "B2B");

            if (planNuevo == null)
                throw new InvalidOperationException("Plan nuevo inexistente o inactivo (B2B).");

            // Si es el mismo plan, no hagas lío (opcional)
            if (string.Equals(codigoPlanAnterior, planNuevo.codigo, StringComparison.OrdinalIgnoreCase))
            {
                return new admin_cambiar_plan_response
                {
                    ok = true,
                    id_cuenta = cuenta.id_cuenta,
                    codigo_plan_anterior = codigoPlanAnterior ?? planNuevo.codigo,
                    codigo_plan_nuevo = planNuevo.codigo
                };
            }

            await using var tx = await _context.Database.BeginTransactionAsync();

            // 1) Asignar plan nuevo en cuenta
            cuenta.id_plan = planNuevo.id_plan;
            cuenta.fecha_modif = now;

            // 2) Cerrar suscripciones CUENTA activas previas (si existieran)
            var subsPrev = await _context.Set<ef_suscripciones>()
                .Where(s =>
                    s.scope == "CUENTA" &&
                    s.id_cuenta == cuenta.id_cuenta &&
                    s.activo == true)
                .ToListAsync();

            foreach (var s in subsPrev)
            {
                s.activo = false;

                // Dejamos trazabilidad de cierre
                if (string.IsNullOrWhiteSpace(s.estado) || s.estado == "ACTIVA")
                    s.estado = "CANCELADA";

                s.cancel_at_period_end = true;
                s.cancelled_at = now;
                s.fecha_modif = now;

                // Si querés guardar motivo, podés usar config_json:
                // s.config_json = $"{{\"motivo\":\"{request.motivo}\"}}";
            }

            // 3) Crear suscripción CUENTA ACTIVA con vencimiento real
            var start = now;
            DateTimeOffset? end = null;

            if (string.Equals(planNuevo.periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase))
                end = start.AddMonths(1);
            else if (string.Equals(planNuevo.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase))
                end = start.AddYears(1);
            else
                end = null; // UNICO

            _context.Set<ef_suscripciones>().Add(new ef_suscripciones
            {
                scope = "CUENTA",
                id_cuenta = cuenta.id_cuenta,
                id_plan = planNuevo.id_plan,

                estado = "ACTIVA",
                auto_renueva = false,
                periodo = planNuevo.periodo ?? "MENSUAL",

                current_period_start = start,
                current_period_end = end,

                cancel_at_period_end = false,
                cancelled_at = null,

                activo = true,
                config_json = string.IsNullOrWhiteSpace(request.motivo)
                    ? null
                    : $"{{\"motivo\":\"{request.motivo.Replace("\"", "'")}\"}}",

                fecha_alta = now,
                fecha_modif = null
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return new admin_cambiar_plan_response
            {
                ok = true,
                id_cuenta = cuenta.id_cuenta,
                codigo_plan_anterior = codigoPlanAnterior ?? "(SIN_PLAN)",
                codigo_plan_nuevo = planNuevo.codigo
            };
        }

        public async Task<admin_reactivar_cuenta_response> ReactivarAsync(admin_reactivar_cuenta_request request, long id_usuario_admin)
        {
            if (request.id_cuenta <= 0)
                throw new InvalidOperationException("Debe informar la cuenta.");

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == request.id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("La cuenta no existe.");

            if (cuenta.estado != "S")
                throw new InvalidOperationException("Solo se pueden reactivar cuentas suspendidas.");

            cuenta.estado = "A";
            cuenta.fecha_modif = DateTimeOffset.UtcNow;

            var vinculosCuenta = await _context.ef_cuenta_usuarios
                .Where(x => x.id_cuenta == request.id_cuenta)
                .ToListAsync();

            foreach (var item in vinculosCuenta)
            {
                item.activo = true;
            }

            await _context.SaveChangesAsync();

            return new admin_reactivar_cuenta_response
            {
                ok = true,
                id_cuenta = cuenta.id_cuenta,
                estado = cuenta.estado
            };
        }
        private static DateTimeOffset? CalcularFinPeriodo(DateTimeOffset start, string? periodo)
        {
            if (string.Equals(periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase))
                return start.AddMonths(1);

            if (string.Equals(periodo, "ANUAL", StringComparison.OrdinalIgnoreCase))
                return start.AddYears(1);

            // UNICO u otros: sin vencimiento
            return null;
        }

        private async Task CerrarSuscripcionesCuentaActivasAsync(long idCuenta, DateTimeOffset now)
        {
            var subsPrev = await _context.Set<ef_suscripciones>()
                .Where(s => s.scope == "CUENTA"
                            && s.id_cuenta == idCuenta
                            && s.activo == true)
                .ToListAsync();

            foreach (var s in subsPrev)
            {
                s.activo = false;
                if (string.IsNullOrWhiteSpace(s.estado) || s.estado == "ACTIVA")
                    s.estado = "CANCELADA";

                s.cancel_at_period_end = true;
                s.cancelled_at = now;
                s.fecha_modif = now;
            }
        }

        private void CrearSuscripcionCuentaActiva(long idCuenta, ef_planes plan, DateTimeOffset now)
        {
            var start = now;
            var end = CalcularFinPeriodo(start, plan.periodo);

            _context.Set<ef_suscripciones>().Add(new ef_suscripciones
            {
                scope = "CUENTA",
                id_cuenta = idCuenta,
                id_plan = plan.id_plan,

                estado = "ACTIVA",
                auto_renueva = false,
                periodo = plan.periodo ?? "MENSUAL",

                current_period_start = start,
                current_period_end = end,

                cancel_at_period_end = false,
                cancelled_at = null,

                activo = true,
                config_json = null,

                fecha_alta = now,
                fecha_modif = null
            });
        }
    }
}