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
            // ✅ diasProximo = 0 => "ver todo"
            bool verTodo = diasProximo == 0;

            if (diasProximo < 0) diasProximo = 7;
            if (diasProximo > 365 && !verTodo) diasProximo = 365;

            var now = DateTimeOffset.UtcNow;
            var hasta = verTodo ? (DateTimeOffset?)null : now.AddDays(diasProximo);

            // 1) Traer suscripciones CUENTA activas/past_due con info de cuenta y plan
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
                      && c.estado == "A"
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

                    // ✅ FIX: forzar nullable
                    end = (DateTimeOffset?)s.current_period_end,

                    fecha_alta_sub = s.fecha_alta,

                    plan_codigo = pl != null ? pl.codigo : null,
                    plan_nombre = pl != null ? pl.nombre : null
                }
            ).ToListAsync();

            // 2) Deduplicar por cuenta + contar
            var porCuenta = subs
                .GroupBy(x => x.id_cuenta)
                .Select(g => new
                {
                    id_cuenta = g.Key,
                    cantidad = g.Count(),
                    vigente = g.OrderByDescending(x => x.fecha_alta_sub).First()
                })
                .ToList();

            var vencidas = new System.Collections.Generic.List<CobranzaCuentaItemDTO>();
            var porVencer = new System.Collections.Generic.List<CobranzaCuentaItemDTO>();
            var inconsistencias = new System.Collections.Generic.List<CobranzaCuentaItemDTO>();

            foreach (var c in porCuenta)
            {
                var v = c.vigente;

                // DUPLICADAS
                if (c.cantidad > 1)
                {
                    inconsistencias.Add(new CobranzaCuentaItemDTO
                    {
                        id_cuenta = v.id_cuenta,
                        nombre_cuenta = v.nombre_cuenta,
                        tipo = v.tipo,
                        cuenta_estado = v.cuenta_estado,
                        id_plan = v.id_plan,
                        plan_codigo = v.plan_codigo,
                        plan_nombre = v.plan_nombre,
                        id_suscripcion = v.id_suscripcion,
                        suscripcion_estado = v.suscripcion_estado,
                        periodo = v.periodo,
                        current_period_end = v.end,
                        dias_para_vencer = null,
                        concepto = $"INCONSISTENCIA: {c.cantidad} suscripciones CUENTA activas/past_due (duplicadas).",
                        inconsistente = true
                    });
                    continue;
                }

                // END_NULL en mensual/anual
                bool esMensual = string.Equals(v.periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase);
                bool esAnual = string.Equals(v.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase);
                if ((esMensual || esAnual) && !v.end.HasValue)
                {
                    inconsistencias.Add(new CobranzaCuentaItemDTO
                    {
                        id_cuenta = v.id_cuenta,
                        nombre_cuenta = v.nombre_cuenta,
                        tipo = v.tipo,
                        cuenta_estado = v.cuenta_estado,
                        id_plan = v.id_plan,
                        plan_codigo = v.plan_codigo,
                        plan_nombre = v.plan_nombre,
                        id_suscripcion = v.id_suscripcion,
                        suscripcion_estado = v.suscripcion_estado,
                        periodo = v.periodo,
                        current_period_end = null,
                        dias_para_vencer = null,
                        concepto = "INCONSISTENCIA: Plan mensual/anual sin current_period_end.",
                        inconsistente = true
                    });
                    continue;
                }

                // UNICO sin end: si verTodo, lo podés listar como “por_vencer” (opcional)
                if (!v.end.HasValue)
                {
                    if (verTodo)
                        porVencer.Add(MapCobranza(v, now));
                    continue;
                }

                var end = v.end.Value;

                if (end <= now)
                {
                    vencidas.Add(MapCobranza(v, now));
                }
                else
                {
                    // verTodo => todo lo futuro entra
                    // ventana => solo si end <= hasta
                    if (verTodo || (hasta.HasValue && end <= hasta.Value))
                        porVencer.Add(MapCobranza(v, now));
                }
            }

            // 3) SIN_SUSCRIPCION
            var cuentasA = await _context.Set<ef_cuentas>().AsNoTracking()
                .Where(c => c.estado == "A")
                .Select(c => new { c.id_cuenta, c.nombre_cuenta, c.tipo, cuenta_estado = c.estado, c.id_plan })
                .ToListAsync();

            var idsConSub = porCuenta.Select(x => x.id_cuenta).Distinct().ToHashSet();
            var inc = cuentasA.Where(x => !idsConSub.Contains(x.id_cuenta)).ToList();

            if (inc.Count > 0)
            {
                var planIdsInc = inc.Where(x => x.id_plan != null).Select(x => x.id_plan!.Value).Distinct().ToList();
                var planesById = await _context.Set<ef_planes>().AsNoTracking()
                    .Where(p => planIdsInc.Contains(p.id_plan))
                    .ToDictionaryAsync(p => p.id_plan, p => new { p.codigo, p.nombre });

                foreach (var i in inc)
                {
                    string? codigo = null;
                    string? nombre = null;
                    if (i.id_plan != null && planesById.TryGetValue(i.id_plan.Value, out var p))
                    {
                        codigo = p.codigo;
                        nombre = p.nombre;
                    }

                    inconsistencias.Add(new CobranzaCuentaItemDTO
                    {
                        id_cuenta = i.id_cuenta,
                        nombre_cuenta = i.nombre_cuenta,
                        tipo = i.tipo,
                        cuenta_estado = i.cuenta_estado,
                        id_plan = i.id_plan,
                        plan_codigo = codigo,
                        plan_nombre = nombre,
                        id_suscripcion = null,
                        suscripcion_estado = null,
                        periodo = null,
                        current_period_end = null,
                        dias_para_vencer = null,
                        concepto = "INCONSISTENCIA: Cuenta activa sin suscripción CUENTA activa/past_due",
                        inconsistente = true
                    });
                }
            }

            vencidas = vencidas.OrderBy(x => x.current_period_end).ToList();
            porVencer = porVencer.OrderBy(x => x.current_period_end).ToList();

            return Ok(new CobranzasCuentasResponseDTO
            {
                vencidas = vencidas,
                por_vencer = porVencer,
                inconsistencias = inconsistencias.OrderBy(x => x.nombre_cuenta).ToList()
            });
        }

        private static CobranzaCuentaItemDTO MapCobranza(dynamic x, DateTimeOffset now)
        {
            // end puede venir como DateTimeOffset? o DateTimeOffset según cómo EF materialice el anon type.
            DateTimeOffset? end = null;

            if (x.end is DateTimeOffset)
                end = (DateTimeOffset)x.end;
            else if (x.end is DateTimeOffset?)
                end = (DateTimeOffset?)x.end;

            int? dias = null;
            if (end.HasValue)
            {
                dias = (int)Math.Ceiling((end.Value - now).TotalDays);
                if (dias < 0) dias = 0;
            }

            return new CobranzaCuentaItemDTO
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

                current_period_end = end,
                dias_para_vencer = dias,

                inconsistente = false,
                concepto = null
            };
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
            var now = DateTimeOffset.UtcNow;

            var cuenta = await _context.Set<ef_cuentas>()
                .SingleOrDefaultAsync(c => c.id_cuenta == idCuenta);

            if (cuenta == null) return NotFound("Cuenta inexistente.");
            if (cuenta.estado != "A") return BadRequest("La cuenta no está activa (estado != A).");
            if (cuenta.id_plan == null) return BadRequest("Cuenta activa sin id_plan asignado.");

            var plan = await _context.Set<ef_planes>()
                .SingleOrDefaultAsync(p => p.id_plan == cuenta.id_plan.Value && p.activo == true && p.tipo == "B2B");

            if (plan == null) return BadRequest("Plan B2B inválido/inactivo para la cuenta.");

            // Traer suscripciones activas/past_due de CUENTA para esa cuenta
            var subsActivas = await _context.Set<ef_suscripciones>()
                .Where(s => s.scope == "CUENTA"
                            && s.id_cuenta == idCuenta
                            && s.activo == true
                            && (s.estado == "ACTIVA" || s.estado == "PAST_DUE"))
                .OrderByDescending(s => s.fecha_alta)
                .ToListAsync();

            var resp = new CobranzasCorregirResponseDTO { ok = true, corregidos = 0 };

            // Helper fin de período
            DateTimeOffset? CalcEnd(DateTimeOffset start)
            {
                if (string.Equals(plan.periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase)) return start.AddMonths(1);
                if (string.Equals(plan.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase)) return start.AddYears(1);
                return null;
            }

            await using var tx = await _context.Database.BeginTransactionAsync();

            if (subsActivas.Count == 0)
            {
                // 1) Crear suscripción faltante
                var end = CalcEnd(now);

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
                    cancel_at_period_end = false,
                    cancelled_at = null,
                    activo = true,
                    fecha_alta = now
                });

                resp.corregidos++;
                resp.detalle.Add("Se creó suscripción CUENTA ACTIVA faltante.");
            }
            else
            {
                // 2) Si hay duplicadas, cerrar todas menos la más nueva (subsActivas[0])
                if (subsActivas.Count > 1)
                {
                    var keep = subsActivas.First();
                    foreach (var s in subsActivas.Skip(1))
                    {
                        s.activo = false;
                        s.estado = "CANCELADA";
                        s.cancel_at_period_end = true;
                        s.cancelled_at = now;
                        s.fecha_modif = now;
                    }

                    resp.corregidos++;
                    resp.detalle.Add($"Se cerraron {subsActivas.Count - 1} suscripciones activas duplicadas. Se conservó id_suscripcion={keep.id_suscripcion}.");
                }

                // 3) Si la suscripción “vigente” no tiene end y el plan es MENSUAL/ANUAL, setear end.
                var vigente = subsActivas.First(); // la más nueva
                if (!vigente.current_period_end.HasValue &&
                    (string.Equals(plan.periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(plan.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase)))
                {
                    vigente.current_period_start = vigente.current_period_start ?? now;
                    vigente.current_period_end = CalcEnd(vigente.current_period_start.Value);
                    vigente.fecha_modif = now;

                    resp.corregidos++;
                    resp.detalle.Add("Se completó current_period_end de la suscripción vigente.");
                }
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(resp);
        }

        // =========================================================
        // POST /admin/cobranzas_cuentas/corregir-inconsistencias
        // Corrige todas las cuentas A sin suscripción CUENTA activa.
        // =========================================================
        [HttpPost("corregir-inconsistencias")]
        public async Task<IActionResult> CorregirInconsistencias()
        {
            var now = DateTimeOffset.UtcNow;

            // Cuentas activas
            var cuentasA = await _context.Set<ef_cuentas>().AsNoTracking()
                .Where(c => c.estado == "A")
                .Select(c => new { c.id_cuenta, c.id_plan })
                .ToListAsync();

            if (cuentasA.Count == 0)
                return Ok(new { ok = true, corregidos = 0 });

            int corregidos = 0;

            await using var tx = await _context.Database.BeginTransactionAsync();

            foreach (var c in cuentasA)
            {
                if (c.id_plan == null) continue;

                var plan = await _context.Set<ef_planes>().AsNoTracking()
                    .SingleOrDefaultAsync(p => p.id_plan == c.id_plan.Value && p.activo == true && p.tipo == "B2B");

                if (plan == null) continue;

                DateTimeOffset? CalcEnd(DateTimeOffset start)
                {
                    if (string.Equals(plan.periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase)) return start.AddMonths(1);
                    if (string.Equals(plan.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase)) return start.AddYears(1);
                    return null;
                }

                var subsActivas = await _context.Set<ef_suscripciones>()
                    .Where(s => s.scope == "CUENTA"
                                && s.id_cuenta == c.id_cuenta
                                && s.activo == true
                                && (s.estado == "ACTIVA" || s.estado == "PAST_DUE"))
                    .OrderByDescending(s => s.fecha_alta)
                    .ToListAsync();

                if (subsActivas.Count == 0)
                {
                    _context.Set<ef_suscripciones>().Add(new ef_suscripciones
                    {
                        scope = "CUENTA",
                        id_cuenta = c.id_cuenta,
                        id_plan = plan.id_plan,
                        estado = "ACTIVA",
                        auto_renueva = false,
                        periodo = plan.periodo ?? "MENSUAL",
                        current_period_start = now,
                        current_period_end = CalcEnd(now),
                        activo = true,
                        fecha_alta = now
                    });

                    corregidos++;
                    continue;
                }

                // Deduplicar: cerrar todas menos la más nueva
                if (subsActivas.Count > 1)
                {
                    foreach (var s in subsActivas.Skip(1))
                    {
                        s.activo = false;
                        s.estado = "CANCELADA";
                        s.cancel_at_period_end = true;
                        s.cancelled_at = now;
                        s.fecha_modif = now;
                    }

                    corregidos++;
                }

                // Completar end si corresponde
                var vigente = subsActivas.First();
                bool esMensual = string.Equals(plan.periodo, "MENSUAL", StringComparison.OrdinalIgnoreCase);
                bool esAnual = string.Equals(plan.periodo, "ANUAL", StringComparison.OrdinalIgnoreCase);

                if ((esMensual || esAnual) && !vigente.current_period_end.HasValue)
                {
                    vigente.current_period_start = vigente.current_period_start ?? now;
                    vigente.current_period_end = CalcEnd(vigente.current_period_start.Value);
                    vigente.fecha_modif = now;
                    corregidos++;
                }
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new { ok = true, corregidos = corregidos });
        }
    }
}
