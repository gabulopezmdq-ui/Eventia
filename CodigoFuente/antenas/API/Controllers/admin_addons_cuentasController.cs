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
    [Route("admin/addons_cuentas")]
    public class admin_addons_cuentasController : ControllerBase
    {
        private readonly DataContext _context;

        public admin_addons_cuentasController(DataContext context)
        {
            _context = context;
        }

        // GET /admin/addons_cuentas/pendientes?mercado=AR&moneda=ARS
        [HttpGet("pendientes")]
        public async Task<IActionResult> Pendientes(
            [FromQuery] string mercado = "AR",
            [FromQuery] string moneda = "ARS")
        {
            var now = DateTimeOffset.UtcNow;

            mercado = (mercado ?? "AR").Trim().ToUpperInvariant();
            moneda = (moneda ?? "ARS").Trim().ToUpperInvariant();

            var items = await (
                from sa in _context.Set<ef_scope_addons>().AsNoTracking()
                join ad in _context.Set<ef_addons>().AsNoTracking()
                    on sa.id_addon equals ad.id_addon
                join c in _context.Set<ef_cuentas>().AsNoTracking()
                    on sa.id_cuenta equals c.id_cuenta
                where sa.scope == "CUENTA"
                      && sa.activo == true
                      && sa.estado == "PENDIENTE"
                orderby sa.fecha_alta descending
                select new
                {
                    sa.id_scope_addon,
                    sa.id_addon,
                    sa.id_cuenta,
                    sa.config_json_override,
                    sa.estado,
                    sa.fecha_alta,
                    ad.codigo,
                    ad.nombre,
                    cuenta_nombre = c.nombre_cuenta
                }
            ).ToListAsync();

            var addonIds = items
                .Select(x => x.id_addon)
                .Distinct()
                .ToList();

            var precios = await _context.Set<ef_precios>().AsNoTracking()
                .Where(p => p.activo == true
                            && p.objeto_tipo == "ADDON"
                            && p.id_addon != null
                            && addonIds.Contains(p.id_addon.Value)
                            && p.codigo_mercado == mercado
                            && p.codigo_moneda == moneda
                            && p.vigente_desde <= now
                            && (p.vigente_hasta == null || p.vigente_hasta > now))
                .OrderByDescending(p => p.vigente_desde)
                .ToListAsync();

            var precioPorAddon = precios
                .GroupBy(x => x.id_addon!.Value)
                .ToDictionary(g => g.Key, g => g.First());

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
                            if (pedido.TryGetProperty("mercado", out var mm))
                                m = mm.GetString() ?? m;

                            if (pedido.TryGetProperty("moneda", out var mn))
                                mo = mn.GetString() ?? mo;
                        }
                    }
                    catch
                    {
                        // ignore
                    }
                }

                decimal? importe = null;

                if (precioPorAddon.TryGetValue(x.id_addon, out var pr))
                {
                    bool tieneLanzamiento =
                        pr.precio_lanzamiento.HasValue
                        && (!pr.lanzamiento_desde.HasValue || pr.lanzamiento_desde.Value <= now)
                        && (!pr.lanzamiento_hasta.HasValue || pr.lanzamiento_hasta.Value >= now);

                    importe = tieneLanzamiento
                        ? pr.precio_lanzamiento.Value
                        : pr.precio_lista;
                }

                return new AdminAddonPendienteItemDTO
                {
                    id_scope_addon = x.id_scope_addon,
                    scope = "CUENTA",
                    id_cuenta = x.id_cuenta,
                    cuenta_nombre = x.cuenta_nombre,
                    addon_codigo = x.codigo,
                    addon_nombre = x.nombre,
                    estado = x.estado,
                    fecha_solicitud = x.fecha_alta,
                    mercado = m,
                    moneda = mo,
                    importe_sugerido = importe,
                    inconsistente = (importe == null),
                    detalle = (importe == null)
                        ? "No hay precio vigente para este addon (mercado/moneda)."
                        : null
                };
            }).ToList();

            return Ok(resp);
        }

        // POST /admin/addons_cuentas/registrar
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] AdminRegistrarAddonPagoRequestDTO req)
        {
            if (req.id_scope_addon <= 0)
                return BadRequest("id_scope_addon inválido.");

            if (req.importe <= 0)
                return BadRequest("importe debe ser > 0.");

            var sa = await _context.Set<ef_scope_addons>()
                .SingleOrDefaultAsync(x => x.id_scope_addon == req.id_scope_addon);

            if (sa == null)
                return NotFound("Solicitud inexistente.");

            if (sa.scope != "CUENTA")
                return BadRequest("La solicitud no es de CUENTA.");

            if (sa.estado != "PENDIENTE")
                return BadRequest("La solicitud no está en estado PENDIENTE.");

            var addon = await _context.Set<ef_addons>().AsNoTracking()
                .SingleOrDefaultAsync(a => a.id_addon == sa.id_addon);

            if (addon == null)
                return BadRequest("Addon inexistente.");

            var now = DateTimeOffset.UtcNow;
            long idAdmin = User.GetUserId();

            await using var tx = await _context.Database.BeginTransactionAsync();

            sa.estado = "ACTIVO";
            sa.fecha_modif = now;

            if (sa.fecha_desde == default)
                sa.fecha_desde = now;

            _context.Set<ef_pagos>().Add(new ef_pagos
            {
                id_evento = null,
                id_cuenta = sa.id_cuenta,
                id_suscripcion = null,

                tipo = "UNICO",
                estado = "APROBADO",

                moneda = (req.moneda ?? "ARS").Trim().ToUpperInvariant(),

                importe = req.importe,
                impuestos = 0,
                total = req.importe,

                concepto = req.concepto
                    ?? $"Pago manual addon {addon.codigo} - cuenta {sa.id_cuenta}",

                idempotency_key = $"ADDON_CTA_{sa.id_scope_addon}",

                snapshot_json = JsonSerializer.Serialize(new
                {
                    scope = "CUENTA",
                    id_scope_addon = sa.id_scope_addon,
                    id_cuenta = sa.id_cuenta,
                    id_addon = sa.id_addon,
                    addon_codigo = addon.codigo,
                    admin = idAdmin
                }),

                activo = true,
                fecha_alta = now
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return Ok(new
            {
                ok = true,
                id_scope_addon = sa.id_scope_addon,
                estado = sa.estado
            });
        }
    }
}