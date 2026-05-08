using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SUPERADMIN")]
    [Route("admin/addons_evento")]
    public class admin_addons_eventoController : ControllerBase
    {
        private readonly DataContext _context;

        public admin_addons_eventoController(DataContext context)
        {
            _context = context;
        }

        // GET /admin/addons_evento/pendientes?mercado=AR&moneda=ARS
        [HttpGet("pendientes")]
        public async Task<IActionResult> Pendientes([FromQuery] string mercado = "AR", [FromQuery] string moneda = "ARS")
        {
            var now = DateTimeOffset.UtcNow;
            mercado = (mercado ?? "AR").Trim().ToUpperInvariant();
            moneda = (moneda ?? "ARS").Trim().ToUpperInvariant();

            var items = await (
                from sa in _context.Set<ef_scope_addons>().AsNoTracking()
                join ad in _context.Set<ef_addons>().AsNoTracking() on sa.id_addon equals ad.id_addon
                join ev in _context.Set<ef_eventos>().AsNoTracking() on sa.id_evento equals ev.id_evento
                join te in _context.Set<ef_tipos_evento>().AsNoTracking() on ev.id_tipo_evento equals te.id_tipo_evento
                where sa.scope == "EVENTO"
                      && sa.activo == true
                      && sa.estado == "PENDIENTE"
                orderby sa.fecha_alta descending
                select new
                {
                    sa.id_scope_addon,
                    sa.id_addon,
                    sa.id_evento,
                    sa.config_json_override,
                    sa.estado,
                    sa.fecha_alta,
                    ad.codigo,
                    ad.nombre,
                    ev.anfitriones_texto,
                    tipo_evento_codigo = te.codigo
                }
            ).ToListAsync();

            // parse moneda/mercado desde config_json_override si existe
            var addonIds = items.Select(x => x.id_addon).Distinct().ToList();

            var precios = await _context.Set<ef_precios>().AsNoTracking()
                .Where(p => p.activo == true
                            && p.objeto_tipo == "ADDON"
                            && p.id_addon != null
                            && addonIds.Contains(p.id_addon.Value)
                            && p.mercado == mercado
                            && p.moneda == moneda
                            && p.vigente_desde <= now
                            && (p.vigente_hasta == null || p.vigente_hasta > now))
                .OrderByDescending(p => p.vigente_desde)
                .ToListAsync();

            var precioPorAddon = precios.GroupBy(x => x.id_addon!.Value).ToDictionary(g => g.Key, g => g.First());

            var resp = items.Select(x =>
            {
                string? m = mercado;
                string? mo = moneda;

                if (!string.IsNullOrWhiteSpace(x.config_json_override))
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(x.config_json_override);
                        if (doc.RootElement.TryGetProperty("pedido", out var pedido))
                        {
                            if (pedido.TryGetProperty("mercado", out var mm)) m = mm.GetString() ?? m;
                            if (pedido.TryGetProperty("moneda", out var mn)) mo = mn.GetString() ?? mo;
                        }
                    }
                    catch { /* ignore */ }
                }

                decimal? importe = null;
                if (precioPorAddon.TryGetValue(x.id_addon, out var pr))
                    importe = pr.importe;

                return new AdminAddonPendienteItemDTO
                {
                    id_scope_addon = x.id_scope_addon,
                    scope = "EVENTO",
                    id_evento = x.id_evento,
                    addon_codigo = x.codigo,
                    addon_nombre = x.nombre,
                    evento_anfitriones = x.anfitriones_texto,
                    tipo_evento_codigo = x.tipo_evento_codigo,
                    estado = x.estado,
                    fecha_solicitud = x.fecha_alta,
                    mercado = m,
                    moneda = mo,
                    importe_sugerido = importe,
                    inconsistente = (importe == null),
                    detalle = (importe == null) ? "No hay precio vigente para este addon (mercado/moneda)." : null
                };
            }).ToList();

            return Ok(resp);
        }

        // POST /admin/addons_evento/registrar
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] AdminRegistrarAddonPagoRequestDTO req)
        {
            if (req.id_scope_addon <= 0) return BadRequest("id_scope_addon inválido.");
            if (req.importe <= 0) return BadRequest("importe debe ser > 0.");

            var sa = await _context.Set<ef_scope_addons>()
                .SingleOrDefaultAsync(x => x.id_scope_addon == req.id_scope_addon);

            if (sa == null) return NotFound("Solicitud inexistente.");
            if (sa.scope != "EVENTO") return BadRequest("La solicitud no es de EVENTO.");
            if (sa.estado != "PENDIENTE") return BadRequest("La solicitud no está en estado PENDIENTE.");

            var addon = await _context.Set<ef_addons>().AsNoTracking()
                .SingleOrDefaultAsync(a => a.id_addon == sa.id_addon);

            if (addon == null) return BadRequest("Addon inexistente.");

            var now = DateTimeOffset.UtcNow;
            long idAdmin = User.GetUserId();

            await using var tx = await _context.Database.BeginTransactionAsync();

            // activar addon
            sa.estado = "ACTIVO";
            sa.fecha_modif = now;
            if (sa.fecha_desde == default) sa.fecha_desde = now;

            // registrar pago APROBADO (manual) - NO crea pago pendiente
            _context.Set<ef_pagos>().Add(new ef_pagos
            {
                id_evento = sa.id_evento,
                id_cuenta = null,
                id_suscripcion = null,
                tipo = "UNICO",
                estado = "APROBADO",
                moneda = (req.moneda ?? "ARS").Trim().ToUpperInvariant(),
                importe = req.importe,
                impuestos = 0,
                total = req.importe,
                concepto = req.concepto ?? $"Pago manual addon {addon.codigo} - evento {sa.id_evento}",
                idempotency_key = $"ADDON_EVT_{sa.id_scope_addon}",
                snapshot_json = System.Text.Json.JsonSerializer.Serialize(new
                {
                    scope = "EVENTO",
                    id_scope_addon = sa.id_scope_addon,
                    id_evento = sa.id_evento,
                    id_addon = sa.id_addon,
                    addon_codigo = addon.codigo,
                    admin = idAdmin
                }),
                activo = true,
                fecha_alta = now
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new { ok = true, id_scope_addon = sa.id_scope_addon, estado = sa.estado });
        }
    }
}
