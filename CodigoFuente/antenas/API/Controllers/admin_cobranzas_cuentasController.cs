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
    [Authorize(Roles = "SUPERADMIN")]
    [Route("admin/cobranzas_cuentas")]
    public class admin_cobranzas_cuentasController : ControllerBase
    {
        private readonly DataContext _context;

        public admin_cobranzas_cuentasController(DataContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET /admin/cobranzas_cuentas/pendientes?diasProximo=7
        // - vencidas: end <= now
        // - por_vencer: end > now && end <= now + diasProximo
        // - inconsistencias: cuenta A sin suscripción CUENTA activa
        // =========================================================
        [HttpGet("pendientes")]
        public async Task<ActionResult<CobranzasCuentasResponseDTO>> Pendientes([FromQuery] int diasProximo = 7)
        {
            var now = DateTimeOffset.UtcNow;
            var hasta = now.AddDays(diasProximo);

            // Suscripciones de CUENTA activas/past_due con datos de cuenta + plan
            var subs = await (
                from s in _context.Set<ef_suscripciones>().AsNoTracking()
                join c in _context.Set<ef_cuentas>().AsNoTracking()
                    on s.id_cuenta equals c.id_cuenta
                join pl in _context.Set<ef_planes>().AsNoTracking()
                    on s.id_plan equals pl.id_plan into plJ
                from pl in plJ.DefaultIfEmpty()
                where s.activo == true
                      && s.scope == "CUENTA"
                      && s.id_cuenta != null
                      && (s.estado == "ACTIVA" || s.estado == "PAST_DUE")
                select new
                {
                    c.id_cuenta,
                    c.nombre_cuenta,
                    c.tipo,
                    cuenta_estado = c.estado,
                    c.id_plan,

                    id_suscripcion = s.id_suscripcion,
                    suscripcion_estado = s.estado,
                    periodo = s.periodo,
                    end = s.current_period_end,

                    plan_codigo = pl != null ? pl.codigo : null,
                    plan_nombre = pl != null ? pl.nombre : null
                }
            ).ToListAsync();

            var vencidas = subs
                .Where(x => x.end.HasValue && x.end.Value <= now)
                .OrderByDescending(x => x.end)
                .Select(x => new CobranzaCuentaItemDTO
                {
                    id_cuenta = x.id_cuenta,
                    nombre_cuenta = x.nombre_cuenta,
                    tipo = x.tipo,
                    cuenta_estado = x.cuenta_estado,
                    id_plan = x.id_plan,
                    plan_codigo = x.plan_codigo,
                    plan_nombre = x.plan_nombre,
                    id_suscripcion = x.id_suscripcion,
                    suscripcion_estado = x.suscripcion_estado,
                    periodo = x.periodo,
                    current_period_end = x.end,
                    dias_para_vencer = 0,
                    inconsistente = false
                })
                .ToList();

            var porVencer = subs
                .Where(x => x.end.HasValue && x.end.Value > now && x.end.Value <= hasta)
                .OrderBy(x => x.end)
                .Select(x => new CobranzaCuentaItemDTO
                {
                    id_cuenta = x.id_cuenta,
                    nombre_cuenta = x.nombre_cuenta,
                    tipo = x.tipo,
                    cuenta_estado = x.cuenta_estado,
                    id_plan = x.id_plan,
                    plan_codigo = x.plan_codigo,
                    plan_nombre = x.plan_nombre,
                    id_suscripcion = x.id_suscripcion,
                    suscripcion_estado = x.suscripcion_estado,
                    periodo = x.periodo,
                    current_period_end = x.end,
                    dias_para_vencer = (int)Math.Ceiling((x.end!.Value - now).TotalDays),
                    inconsistente = false
                })
                .ToList();

            // Inconsistencias: cuenta activa sin suscripción CUENTA activa/past_due
            var cuentasA = await _context.Set<ef_cuentas>().AsNoTracking()
                .Where(c => c.estado == "A")
                .Select(c => new { c.id_cuenta, c.nombre_cuenta, c.tipo, cuenta_estado = c.estado, c.id_plan })
                .ToListAsync();

            var idsConSub = subs.Select(x => x.id_cuenta).Distinct().ToHashSet();
            var inc = cuentasA.Where(c => !idsConSub.Contains(c.id_cuenta)).ToList();

            // Para devolver plan_codigo/plan_nombre en inconsistencias
            var planIdsInc = inc.Where(x => x.id_plan != null).Select(x => x.id_plan!.Value).Distinct().ToList();
            var planesById = await _context.Set<ef_planes>().AsNoTracking()
                .Where(p => planIdsInc.Contains(p.id_plan))
                .ToDictionaryAsync(p => p.id_plan, p => new { p.codigo, p.nombre });

            var inconsistencias = inc
                .OrderByDescending(x => x.id_cuenta)
                .Select(c =>
                {
                    string? codigo = null;
                    string? nombre = null;

                    if (c.id_plan != null && planesById.TryGetValue(c.id_plan.Value, out var p))
                    {
                        codigo = p.codigo;
                        nombre = p.nombre;
                    }

                    return new CobranzaCuentaItemDTO
                    {
                        id_cuenta = c.id_cuenta,
                        nombre_cuenta = c.nombre_cuenta,
                        tipo = c.tipo,
                        cuenta_estado = c.cuenta_estado,
                        id_plan = c.id_plan,
                        plan_codigo = codigo,
                        plan_nombre = nombre,
                        id_suscripcion = null,
                        suscripcion_estado = null,
                        periodo = null,
                        current_period_end = null,
                        dias_para_vencer = null,
                        concepto = "INCONSISTENCIA: Cuenta activa sin suscripción CUENTA activa",
                        inconsistente = true
                    };
                })
                .ToList();

            return Ok(new CobranzasCuentasResponseDTO
            {
                vencidas = vencidas,
                por_vencer = porVencer,
                inconsistencias = inconsistencias
            });
        }

        // =========================================================
        // POST /admin/cobranzas_cuentas/registrar
        // Registra pago manual APROBADO (cuenta) y avanza el período.
        // =========================================================
        [HttpPost("registrar")]
        public async Task<IActionResult> RegistrarPagoManual([FromBody] PagoManualCuentaRequestDTO req)
        {
            if (req == null) return BadRequest("Body requerido.");

            var cuenta = await _context.Set<ef_cuentas>()
                .SingleOrDefaultAsync(c => c.id_cuenta == req.IdCuenta);

            if (cuenta == null)
                return NotFound("Cuenta inexistente.");

            var sub = await _context.Set<ef_suscripciones>()
                .SingleOrDefaultAsync(s =>
                    s.id_suscripcion == req.IdSuscripcion
                    && s.scope == "CUENTA"
                    && s.id_cuenta == req.IdCuenta
                    && s.activo == true);

            if (sub == null)
                return BadRequest("Suscripción inexistente o no corresponde a la cuenta.");

            if (!sub.current_period_end.HasValue)
                return BadRequest("La suscripción no tiene current_period_end. No se puede cobrar recurrente sin vencimiento.");

            var now = DateTimeOffset.UtcNow;
            long idAdmin = User.GetUserId();

            await using var tx = await _context.Database.BeginTransactionAsync();

            // Insert pago APROBADO
            _context.Set<ef_pagos>().Add(new ef_pagos
            {
                id_cuenta = req.IdCuenta,
                id_suscripcion = req.IdSuscripcion,
                tipo = "RECURRENTE",
                estado = "APROBADO",
                moneda = req.Moneda,
                importe = req.Importe,
                impuestos = 0,
                total = req.Importe,
                concepto = req.Concepto ?? $"Pago manual cuenta {req.IdCuenta}",
                activo = true,
                fecha_alta = now
            });

            // Avanzar período
            var prevEnd = sub.current_period_end.Value;
            sub.current_period_start = prevEnd;

            if (string.Equals(sub.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase))
                sub.current_period_end = prevEnd.AddYears(1);
            else
                sub.current_period_end = prevEnd.AddMonths(1);

            if (string.Equals(sub.estado, "PAST_DUE", StringComparison.OrdinalIgnoreCase))
                sub.estado = "ACTIVA";

            sub.fecha_modif = now;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new { ok = true, id_cuenta = req.IdCuenta, id_suscripcion = req.IdSuscripcion, next_due = sub.current_period_end });
        }

        // =========================================================
        // POST /admin/cobranzas_cuentas/corregir-inconsistencia?idCuenta=7
        // Crea suscripción CUENTA ACTIVA si falta (cuenta A sin suscripción activa).
        // =========================================================
        [HttpPost("corregir-inconsistencia")]
        public async Task<IActionResult> CorregirInconsistencia([FromQuery] long idCuenta)
        {
            var cuenta = await _context.Set<ef_cuentas>()
                .SingleOrDefaultAsync(c => c.id_cuenta == idCuenta);

            if (cuenta == null) return NotFound("Cuenta inexistente.");
            if (cuenta.estado != "A") return BadRequest("La cuenta no está activa (estado != A).");
            if (cuenta.id_plan == null) return BadRequest("Cuenta activa sin id_plan.");

            bool yaTiene = await _context.Set<ef_suscripciones>()
                .AnyAsync(s => s.scope == "CUENTA"
                               && s.id_cuenta == idCuenta
                               && s.activo == true
                               && (s.estado == "ACTIVA" || s.estado == "PAST_DUE"));

            if (yaTiene)
                return Ok(new { ok = true, mensaje = "La cuenta ya tiene suscripción activa." });

            var plan = await _context.Set<ef_planes>()
                .SingleOrDefaultAsync(p => p.id_plan == cuenta.id_plan.Value && p.activo == true && p.tipo == "B2B");

            if (plan == null)
                return BadRequest("Plan asociado inválido o inactivo.");

            var now = DateTimeOffset.UtcNow;

            DateTimeOffset? end = null;
            if (string.Equals(plan.periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase))
                end = now.AddMonths(1);
            else if (string.Equals(plan.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase))
                end = now.AddYears(1);

            _context.Set<ef_suscripciones>().Add(new ef_suscripciones
            {
                scope = "CUENTA",
                id_cuenta = idCuenta,
                id_plan = plan.id_plan,
                estado = "ACTIVA",
                auto_renueva = false,
                periodo = plan.periodo ?? "MENSUAL",
                current_period_start = now,
                current_period_end = end,
                activo = true,
                fecha_alta = now
            });

            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_cuenta = idCuenta, current_period_end = end });
        }

        // =========================================================
        // POST /admin/cobranzas_cuentas/corregir-inconsistencias
        // Corrige todas las cuentas A sin suscripción CUENTA activa.
        // =========================================================
        [HttpPost("corregir-inconsistencias")]
        public async Task<IActionResult> CorregirInconsistencias()
        {
            var now = DateTimeOffset.UtcNow;

            var cuentasA = await _context.Set<ef_cuentas>().AsNoTracking()
                .Where(c => c.estado == "A")
                .Select(c => new { c.id_cuenta, c.id_plan })
                .ToListAsync();

            var ids = cuentasA.Select(x => x.id_cuenta).ToList();

            var conSub = await _context.Set<ef_suscripciones>().AsNoTracking()
                .Where(s => s.scope == "CUENTA"
                            && s.activo == true
                            && s.id_cuenta != null
                            && ids.Contains(s.id_cuenta.Value)
                            && (s.estado == "ACTIVA" || s.estado == "PAST_DUE"))
                .Select(s => s.id_cuenta!.Value)
                .Distinct()
                .ToListAsync();

            var faltan = cuentasA.Where(c => !conSub.Contains(c.id_cuenta)).ToList();
            if (faltan.Count == 0)
                return Ok(new { ok = true, corregidos = 0 });

            var planIds = faltan.Where(x => x.id_plan != null).Select(x => x.id_plan!.Value).Distinct().ToList();
            var planes = await _context.Set<ef_planes>().AsNoTracking()
                .Where(p => planIds.Contains(p.id_plan) && p.activo == true && p.tipo == "B2B")
                .ToDictionaryAsync(p => p.id_plan, p => p.periodo);

            foreach (var c in faltan)
            {
                if (c.id_plan == null) continue;

                if (!planes.TryGetValue(c.id_plan.Value, out var periodo))
                    periodo = "MENSUAL";

                DateTimeOffset? end = null;
                if (string.Equals(periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase))
                    end = now.AddMonths(1);
                else if (string.Equals(periodo, "ANUAL", StringComparison.OrdinalIgnoreCase))
                    end = now.AddYears(1);

                _context.Set<ef_suscripciones>().Add(new ef_suscripciones
                {
                    scope = "CUENTA",
                    id_cuenta = c.id_cuenta,
                    id_plan = c.id_plan.Value,
                    estado = "ACTIVA",
                    auto_renueva = false,
                    periodo = periodo ?? "MENSUAL",
                    current_period_start = now,
                    current_period_end = end,
                    activo = true,
                    fecha_alta = now
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { ok = true, corregidos = faltan.Count });
        }
    }
}
