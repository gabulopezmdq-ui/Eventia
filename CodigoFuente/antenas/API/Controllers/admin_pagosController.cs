using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
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
    [Route("admin/pagos")]
    public class admin_pagosController : ControllerBase
    {
        private readonly DataContext _context;

        public admin_pagosController(DataContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET /admin/pagos/pendientes
        // Lista pagos PENDIENTE + evento/plan/datos básicos
        // y también detecta inconsistencias (evento en P sin pago pendiente)
        // =========================================================
        [HttpGet("pendientes")]
        public async Task<ActionResult<PagosPendientesResponseDTO>> Pendientes()
        {
            // 1) Pagos pendientes (fuente principal)
            var pendientes = await (
                from p in _context.Set<ef_pagos>().AsNoTracking()
                join ev in _context.Set<ef_eventos>().AsNoTracking() on p.id_evento equals ev.id_evento
                join pl in _context.Set<ef_planes>().AsNoTracking() on ev.id_plan equals pl.id_plan into plJ
                from pl in plJ.DefaultIfEmpty()
                join te in _context.Set<ef_tipos_evento>().AsNoTracking() on ev.id_tipo_evento equals te.id_tipo_evento
                where p.activo == true
                      && p.estado == "PENDIENTE"
                      && p.id_evento != null
                orderby p.fecha_alta descending
                select new PagoPendienteItemDTO
                {
                    id_pago = p.id_pago,
                    id_evento = ev.id_evento,
                    evento_estado = ev.estado,
                    plan_codigo = pl != null ? pl.codigo : null,
                    plan_nombre = pl != null ? pl.nombre : null,
                    tipo_evento_codigo = te.codigo,
                    anfitriones_texto = ev.anfitriones_texto,
                    moneda = p.moneda,
                    importe = p.total != 0 ? p.total : p.importe,
                    fecha_alta_pago = p.fecha_alta,
                    concepto = p.concepto,
                    inconsistente = false
                }
            ).ToListAsync();

            // 2) Inconsistencias: eventos con estado PendientePago pero sin pago pendiente
            // (Esto no debería pasar si tu CrearEventoAsync siempre crea ef_pagos PENDIENTE)
            var eventosP = await _context.Set<ef_eventos>().AsNoTracking()
                .Where(e => e.estado == EventoEstado.PendientePago)
                .Select(e => new { e.id_evento, e.id_plan, e.id_tipo_evento, e.anfitriones_texto, e.estado })
                .ToListAsync();

            var idsEventosP = eventosP.Select(x => x.id_evento).ToList();

            var eventosConPagoPendiente = await _context.Set<ef_pagos>().AsNoTracking()
                .Where(p => p.activo == true && p.estado == "PENDIENTE" && p.id_evento != null && idsEventosP.Contains(p.id_evento.Value))
                .Select(p => p.id_evento!.Value)
                .Distinct()
                .ToListAsync();

            var idsInconsistentes = idsEventosP.Except(eventosConPagoPendiente).ToList();

            var inconsistencias = await (
                from ev in _context.Set<ef_eventos>().AsNoTracking()
                join pl in _context.Set<ef_planes>().AsNoTracking() on ev.id_plan equals pl.id_plan into plJ
                from pl in plJ.DefaultIfEmpty()
                join te in _context.Set<ef_tipos_evento>().AsNoTracking() on ev.id_tipo_evento equals te.id_tipo_evento
                where idsInconsistentes.Contains(ev.id_evento)
                select new PagoPendienteItemDTO
                {
                    id_pago = 0,
                    id_evento = ev.id_evento,
                    evento_estado = ev.estado,
                    plan_codigo = pl != null ? pl.codigo : null,
                    plan_nombre = pl != null ? pl.nombre : null,
                    tipo_evento_codigo = te.codigo,
                    anfitriones_texto = ev.anfitriones_texto,
                    moneda = "ARS",
                    importe = 0,
                    fecha_alta_pago = ev.fecha_alta,
                    concepto = "INCONSISTENCIA: Evento en P sin pago pendiente",
                    inconsistente = true
                }
            ).ToListAsync();

            return Ok(new PagosPendientesResponseDTO
            {
                pendientes = pendientes,
                inconsistencias = inconsistencias
            });
        }

        [HttpPost("corregir-inconsistencia")]
        public async Task<IActionResult> CorregirInconsistencia([FromQuery] long idEvento)
        {
            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null) return NotFound("Evento inexistente.");

            // Solo tiene sentido si está en PendientePago
            if (ev.estado != EventoEstado.PendientePago)
                return BadRequest("El evento no está en estado PendientePago (P).");

            // Ya existe pago pendiente?
            bool yaExiste = await _context.Set<ef_pagos>()
                .AnyAsync(p => p.activo == true && p.id_evento == idEvento && p.estado == "PENDIENTE");

            if (yaExiste)
                return Ok(new { ok = true, mensaje = "Ya existe pago pendiente para el evento." });

            // Plan del evento (si no hay, error)
            var plan = await _context.Set<ef_planes>()
                .AsNoTracking()
                .SingleOrDefaultAsync(p => p.id_plan == ev.id_plan);

            if (plan == null)
                return BadRequest("El evento no tiene plan asignado.");

            var now = DateTimeOffset.UtcNow;

            _context.Set<ef_pagos>().Add(new ef_pagos
            {
                id_evento = idEvento,
                tipo = "UNICO",
                estado = "PENDIENTE",
                moneda = "ARS",
                importe = 0,
                impuestos = 0,
                total = 0,
                concepto = $"Plan {plan.codigo} pendiente - evento {idEvento}",
                activo = true,
                fecha_alta = now
            });

            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_evento = idEvento });
        }

        // =========================================================
        // POST /admin/pagos/registrar
        // Registra pago manual APROBADO, activa evento y deja historial.
        // =========================================================
        [HttpPost("registrar")]
        public async Task<IActionResult> RegistrarPagoManual([FromBody] PagoManualRequestDTO req)
        {
            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(x => x.id_evento == req.IdEvento);

            if (ev == null)
                return NotFound("Evento inexistente.");

            var plan = await _context.Set<ef_planes>()
                .SingleOrDefaultAsync(p => p.codigo == req.CodigoPlan && p.activo == true && p.tipo == "B2C");

            if (plan == null)
                return BadRequest("Plan inexistente o inactivo.");

            var now = DateTimeOffset.UtcNow;
            long idAdmin = User.GetUserId();

            await using var tx = await _context.Database.BeginTransactionAsync();

            // 1) Asignar plan al evento (por si estaba en FREE u otro)
            ev.id_plan = plan.id_plan;

            // 2) Marcar pagos pendientes anteriores como "CANCELADO" (opcional pero recomendable)
            // Así queda 1 pago aprobado “vigente” y evitás confusiones.
            var pagosPendientesPrevios = await _context.Set<ef_pagos>()
                .Where(p => p.id_evento == ev.id_evento && p.activo == true && p.estado == "PENDIENTE")
                .ToListAsync();

            foreach (var p in pagosPendientesPrevios)
            {
                p.estado = "CANCELADO";
                p.fecha_modif = now;
            }

            // 3) Registrar pago APROBADO
            _context.Set<ef_pagos>().Add(new ef_pagos
            {
                id_evento = ev.id_evento,
                tipo = "UNICO",
                estado = "APROBADO",
                moneda = req.Moneda,
                importe = req.Importe,
                impuestos = 0,
                total = req.Importe,
                concepto = req.Concepto ?? $"Pago manual plan {plan.codigo}",
                activo = true,
                fecha_alta = now
            });

            // 4) Activar evento
            ev.estado = EventoEstado.Activo;
            ev.fecha_modif = now;

            var links = await _context.Set<ef_evento_acceso_links>()
                    .Where(x => x.id_evento == ev.id_evento)
                    .ToListAsync();

            foreach (var link in links)
            {
                link.activo = true;
                link.fecha_modif = now;
            }

            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = ev.id_evento,
                id_usuario = idAdmin,
                fecha = now,
                estado = EventoEstado.Activo,
                observaciones = $"Activación por pago manual. Plan: {plan.codigo}. Importe: {req.Importe} {req.Moneda}"
            });

            // 5) Suscripción ACTIVA (historial)
            _context.Set<ef_suscripciones>().Add(new ef_suscripciones
            {
                scope = "EVENTO",
                id_evento = ev.id_evento,
                id_plan = plan.id_plan,
                estado = "ACTIVA",
                auto_renueva = false,
                periodo = "UNICO",
                current_period_start = now,
                current_period_end = null,
                activo = true,
                fecha_alta = now
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new { ok = true, id_evento = ev.id_evento, plan = plan.codigo, estado = ev.estado });
        }


        [HttpPost("corregir-inconsistencias")]  //TODAS
        public async Task<IActionResult> CorregirInconsistencias()
        {
            // eventos en P
            var eventosP = await _context.Set<ef_eventos>().AsNoTracking()
                .Where(e => e.estado == EventoEstado.PendientePago)
                .Select(e => new { e.id_evento, e.id_plan })
                .ToListAsync();

            var idsP = eventosP.Select(x => x.id_evento).ToList();

            // eventos que ya tienen PENDIENTE
            var conPendiente = await _context.Set<ef_pagos>().AsNoTracking()
                .Where(p => p.activo == true && p.estado == "PENDIENTE" && p.id_evento != null && idsP.Contains(p.id_evento.Value))
                .Select(p => p.id_evento!.Value)
                .Distinct()
                .ToListAsync();

            var faltan = eventosP.Where(x => !conPendiente.Contains(x.id_evento)).ToList();
            if (faltan.Count == 0)
                return Ok(new { ok = true, corregidos = 0 });

            var now = DateTimeOffset.UtcNow;

            // Traer planes por id para armar concepto
            var planIds = faltan.Select(x => x.id_plan).Where(x => x != null).Select(x => x!.Value).Distinct().ToList();
            var planes = await _context.Set<ef_planes>().AsNoTracking()
                .Where(p => planIds.Contains(p.id_plan))
                .ToDictionaryAsync(p => p.id_plan, p => p.codigo);

            foreach (var ev in faltan)
            {
                if (ev.id_plan == null || !planes.TryGetValue(ev.id_plan.Value, out var codigoPlan))
                    codigoPlan = "PLAN_DESCONOCIDO";

                _context.Set<ef_pagos>().Add(new ef_pagos
                {
                    id_evento = ev.id_evento,
                    tipo = "UNICO",
                    estado = "PENDIENTE",
                    moneda = "ARS",
                    importe = 0,
                    impuestos = 0,
                    total = 0,
                    concepto = $"Plan {codigoPlan} pendiente - evento {ev.id_evento}",
                    activo = true,
                    fecha_alta = now
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { ok = true, corregidos = faltan.Count });
        }


    }
}
