using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
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

            // 1) Asignar plan al evento
            ev.id_plan = plan.id_plan;

            // 2) Registrar pago APROBADO
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

            // 3) Activar evento
            ev.estado = EventoEstado.Activo;
            ev.fecha_modif = now;

            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = ev.id_evento,
                id_usuario = idAdmin,
                fecha = now,
                estado = EventoEstado.Activo,
                observaciones = $"Activación por pago manual. Plan: {plan.codigo}. Importe: {req.Importe} {req.Moneda}"
            });

            // 4) (opcional, recomendado) dejar suscripción como ACTIVA para historial
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
    }
}
