using API.DataSchema;
using API.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class eventos_comercialController : ControllerBase
    {
        private readonly DataContext _context;

        public eventos_comercialController(DataContext context)
        {
            _context = context;
        }

        // GET /eventos_comercial/Get?idEvento=123
        [HttpGet("Get")]
        public async Task<IActionResult> Get([FromQuery] long idEvento)
        {
            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null) return NotFound("Evento inexistente.");

            // plan
            var plan = await _context.Set<ef_planes>()
                .AsNoTracking()
                .Where(p => p.id_plan == ev.id_plan)
                .Select(p => new { p.codigo, p.nombre })
                .FirstOrDefaultAsync();

            // trial (si existe)
            var sus = await _context.Set<ef_suscripciones>()
                .AsNoTracking()
                .Where(s => s.scope == "EVENTO" && s.id_evento == idEvento && s.activo == true)
                .OrderByDescending(s => s.fecha_alta)
                .FirstOrDefaultAsync();

            int? dias = null;
            bool? vencido = null;

            if (sus?.current_period_end != null)
            {
                var end = sus.current_period_end.Value;
                var seconds = (end - DateTimeOffset.UtcNow).TotalSeconds;
                var d = (int)Math.Ceiling(seconds / 86400.0);
                if (d < 0) d = 0;
                dias = d;
                vencido = DateTimeOffset.UtcNow >= end;
            }

            // pago pendiente
            var pagoPendiente = await _context.Set<ef_pagos>()
                .AsNoTracking()
                .AnyAsync(p => p.id_evento == idEvento && p.activo == true && p.estado == "PENDIENTE");

            return Ok(new
            {
                id_evento = ev.id_evento,
                estado = ev.estado,
                plan_codigo = plan?.codigo,
                plan_nombre = plan?.nombre,
                trial_dias_restantes = dias,
                trial_vencido = vencido,
                pago_pendiente = pagoPendiente
            });
        }
    }
}
