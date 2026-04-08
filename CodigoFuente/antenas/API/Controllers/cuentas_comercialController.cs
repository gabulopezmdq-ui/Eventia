using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize] // el usuario debe estar logueado
    [Route("[controller]")]
    public class cuentas_comercialController : ControllerBase
    {
        private readonly DataContext _context;

        public cuentas_comercialController(DataContext context)
        {
            _context = context;
        }

        // GET /cuentas_comercial/Get?idCuenta=7
        [HttpGet("Get")]
        public async Task<ActionResult<CuentaComercialResponseDTO>> Get([FromQuery] long idCuenta)
        {
            long idUsuario = User.GetUserId();

            // Seguridad: el usuario debe estar vinculado a la cuenta (ajustá si tu tabla se llama distinto)
            bool pertenece = await _context.Set<ef_cuenta_usuarios>()
                .AnyAsync(x => x.id_cuenta == idCuenta && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var cuenta = await _context.Set<ef_cuentas>().AsNoTracking()
                .SingleOrDefaultAsync(c => c.id_cuenta == idCuenta);

            if (cuenta == null)
                return NotFound("Cuenta inexistente.");

            // Plan
            var plan = await _context.Set<ef_planes>().AsNoTracking()
                .SingleOrDefaultAsync(p => p.id_plan == cuenta.id_plan);

            // Suscripción vigente de CUENTA (la más nueva activa/past_due)
            var sub = await _context.Set<ef_suscripciones>().AsNoTracking()
                .Where(s => s.scope == "CUENTA"
                            && s.id_cuenta == idCuenta
                            && s.activo == true
                            && (s.estado == "ACTIVA" || s.estado == "PAST_DUE"))
                .OrderByDescending(s => s.fecha_alta)
                .FirstOrDefaultAsync();

            var now = DateTimeOffset.UtcNow;

            int? dias = null;
            bool vencida = false;

            if (sub?.current_period_end != null)
            {
                var end = sub.current_period_end.Value;
                vencida = now >= end;

                var seconds = (end - now).TotalSeconds;
                var d = (int)Math.Ceiling(seconds / 86400.0);
                if (d < 0) d = 0;
                dias = d;
            }

            // pago_pendiente = vencida o estado PAST_DUE
            bool pagoPendiente = false;
            if (sub != null)
            {
                pagoPendiente = vencida || string.Equals(sub.estado, "PAST_DUE", StringComparison.OrdinalIgnoreCase);
            }

            string? msg = null;
            if (sub == null)
                msg = "Tu cuenta no tiene una suscripción activa. Contactá al soporte.";
            else if (pagoPendiente)
                msg = "Tu suscripción está vencida. Registrá el pago para continuar con todas las funcionalidades.";
            else if (dias.HasValue && dias.Value <= 3)
                msg = $"Tu suscripción vence en {dias.Value} día(s).";
            else
                msg = "Tu suscripción está al día.";

            var dto = new CuentaComercialResponseDTO
            {
                id_cuenta = cuenta.id_cuenta,
                cuenta_estado = cuenta.estado,

                plan_codigo = plan?.codigo,
                plan_nombre = plan?.nombre,
                periodo = sub?.periodo,

                suscripcion_estado = sub?.estado,
                current_period_end = sub?.current_period_end,

                dias_para_vencer = dias,
                vencida = pagoPendiente,

                pago_pendiente = pagoPendiente,
                mensaje = msg
            };

            return Ok(dto);
        }

        // GET /cuentas_comercial/Pagos?idCuenta=7&take=10
        [HttpGet("Pagos")]
        public async Task<ActionResult<System.Collections.Generic.List<CuentaPagoItemDTO>>> Pagos([FromQuery] long idCuenta, [FromQuery] int take = 10)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_cuenta_usuarios>()
                .AnyAsync(x => x.id_cuenta == idCuenta && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            if (take <= 0) take = 10;
            if (take > 50) take = 50;

            var pagos = await _context.Set<ef_pagos>().AsNoTracking()
                .Where(p => p.id_cuenta == idCuenta && p.activo == true)
                .OrderByDescending(p => p.fecha_alta)
                .Take(take)
                .Select(p => new CuentaPagoItemDTO
                {
                    id_pago = p.id_pago,
                    fecha_alta = p.fecha_alta,
                    estado = p.estado,
                    moneda = p.moneda,
                    importe = (p.total != 0 ? p.total : p.importe),
                    concepto = p.concepto
                })
                .ToListAsync();

            return Ok(pagos);
        }
    }
}