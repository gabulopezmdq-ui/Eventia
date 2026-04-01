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
            if (request.id_cuenta <= 0)
                throw new InvalidOperationException("Debe informar la cuenta.");

            if (string.IsNullOrWhiteSpace(request.codigo_plan))
                throw new InvalidOperationException("Debe informar el código de plan.");

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == request.id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("La cuenta no existe.");

            var plan = await _context.ef_planes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo == request.codigo_plan && x.activo);

            if (plan == null)
                throw new InvalidOperationException("El plan indicado no existe o está inactivo.");

            cuenta.estado = "A";
            cuenta.id_plan = plan.id_plan;
            cuenta.fecha_modif = DateTimeOffset.UtcNow;

            var vinculosCuenta = await _context.ef_cuenta_usuarios
                .Where(x => x.id_cuenta == request.id_cuenta)
                .ToListAsync();

            foreach (var item in vinculosCuenta)
            {
                item.activo = true;
            }

            await _context.SaveChangesAsync();

            var suscripcion = new ef_suscripciones
            {
                scope = "CUENTA",
                id_cuenta = cuenta.id_cuenta,
                id_evento = null,
                id_plan = plan.id_plan,
                estado = "ACTIVA",
                auto_renueva = true,
                periodo = "MENSUAL",
                current_period_start = DateTimeOffset.UtcNow,
                current_period_end = null,
                cancel_at_period_end = false,
                cancelled_at = null,
                external_provider = null,
                external_subscription_id = null,
                external_customer_id = null,
                activo = true,
                config_json = null,
                fecha_alta = DateTimeOffset.UtcNow,
                fecha_modif = null,
                trial_end = null
            };

            _context.ef_suscripciones.Add(suscripcion);
            await _context.SaveChangesAsync();

            return new admin_aprobar_cuenta_response
            {
                ok = true,
                id_cuenta = cuenta.id_cuenta,
                estado = cuenta.estado,
                codigo_plan = plan.codigo
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
            if (request.id_cuenta <= 0)
                throw new InvalidOperationException("Debe informar la cuenta.");

            if (string.IsNullOrWhiteSpace(request.codigo_plan_nuevo))
                throw new InvalidOperationException("Debe informar el nuevo código de plan.");

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == request.id_cuenta);

            if (cuenta == null)
                throw new InvalidOperationException("La cuenta no existe.");

            var planNuevo = await _context.ef_planes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.codigo == request.codigo_plan_nuevo && x.activo);

            if (planNuevo == null)
                throw new InvalidOperationException("El nuevo plan no existe o está inactivo.");

            string codigoPlanAnterior = null;

            if (cuenta.id_plan.HasValue)
            {
                codigoPlanAnterior = await _context.ef_planes
                    .AsNoTracking()
                    .Where(x => x.id_plan == cuenta.id_plan.Value)
                    .Select(x => x.codigo)
                    .FirstOrDefaultAsync();
            }

            var suscripcionActiva = await _context.ef_suscripciones
                .Where(x => x.scope == "CUENTA"
                         && x.id_cuenta == cuenta.id_cuenta
                         && x.estado == "ACTIVA"
                         && x.activo)
                .OrderByDescending(x => x.fecha_alta)
                .FirstOrDefaultAsync();

            if (suscripcionActiva != null)
            {
                suscripcionActiva.estado = "CANCELADA";
                suscripcionActiva.current_period_end = DateTimeOffset.UtcNow;
                suscripcionActiva.cancelled_at = DateTimeOffset.UtcNow;
                suscripcionActiva.fecha_modif = DateTimeOffset.UtcNow;
            }

            cuenta.id_plan = planNuevo.id_plan;
            cuenta.fecha_modif = DateTimeOffset.UtcNow;

            var nuevaSuscripcion = new ef_suscripciones
            {
                scope = "CUENTA",
                id_cuenta = cuenta.id_cuenta,
                id_evento = null,
                id_plan = planNuevo.id_plan,
                estado = "ACTIVA",
                auto_renueva = true,
                periodo = "MENSUAL",
                current_period_start = DateTimeOffset.UtcNow,
                current_period_end = null,
                cancel_at_period_end = false,
                cancelled_at = null,
                external_provider = null,
                external_subscription_id = null,
                external_customer_id = null,
                activo = true,
                config_json = null,
                fecha_alta = DateTimeOffset.UtcNow,
                fecha_modif = null,
                trial_end = null
            };

            _context.ef_suscripciones.Add(nuevaSuscripcion);

            await _context.SaveChangesAsync();

            return new admin_cambiar_plan_response
            {
                ok = true,
                id_cuenta = cuenta.id_cuenta,
                codigo_plan_anterior = codigoPlanAnterior,
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

    }
}