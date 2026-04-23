using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services.Cuentas;
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
    [Authorize]
    [Route("[controller]")]
    public class cuenta_addonsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICuentaContextService _cuentaContext;

        public cuenta_addonsController(DataContext context, ICuentaContextService cuentaContext)
        {
            _context = context;
            _cuentaContext = cuentaContext;
        }

        // GET /cuenta_addons/MisAddons
        [HttpGet("MisAddons")]
        public async Task<IActionResult> MisAddons()
        {
            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            var list = await (
                from sa in _context.Set<ef_scope_addons>().AsNoTracking()
                join ad in _context.Set<ef_addons>().AsNoTracking() on sa.id_addon equals ad.id_addon
                where sa.scope == "CUENTA"
                      && sa.id_cuenta == idCuenta
                      && sa.activo == true
                orderby sa.fecha_alta descending
                select new AddonContratadoDTO
                {
                    id_scope_addon = sa.id_scope_addon,
                    id_addon = ad.id_addon,
                    codigo = ad.codigo,
                    nombre = ad.nombre,
                    estado = sa.estado,
                    activo = sa.activo,
                    fecha_desde = sa.fecha_desde,
                    fecha_hasta = sa.fecha_hasta,
                    config_override = sa.config_json_override
                }
            ).ToListAsync();

            return Ok(list);
        }

        // POST /cuenta_addons/Solicitar
        [HttpPost("Solicitar")]
        public async Task<ActionResult<AddonSolicitudResponseDTO>> Solicitar([FromBody] AddonSolicitudRequestDTO req)
        {
            if (req.id_addon <= 0) return BadRequest("id_addon inválido.");

            long idUsuario = User.GetUserId();
            long idCuenta = await _cuentaContext.GetCuentaIdActualAsync(idUsuario);

            // solo ACCOUNT_ADMIN solicita addons de cuenta
            bool esAdmin = await _cuentaContext.EsAdminCuentaAsync(idUsuario, idCuenta);
            if (!esAdmin) return Forbid();

            var addon = await _context.Set<ef_addons>().AsNoTracking()
                .SingleOrDefaultAsync(a => a.id_addon == req.id_addon && a.activo == true);

            if (addon == null) return BadRequest("Addon inexistente o inactivo.");
            if (addon.scope != "CUENTA") return BadRequest("Este addon no es de scope CUENTA.");

            bool existe = await _context.Set<ef_scope_addons>().AsNoTracking()
                .AnyAsync(sa => sa.scope == "CUENTA"
                                && sa.id_cuenta == idCuenta
                                && sa.id_addon == req.id_addon
                                && sa.activo == true
                                && (sa.estado == "PENDIENTE" || sa.estado == "ACTIVO" || sa.estado == "SUSPENDIDO"));

            if (existe) return BadRequest("Ya existe una solicitud/contratación activa para este addon en la cuenta.");

            var now = DateTimeOffset.UtcNow;

            var meta = new
            {
                pedido = new
                {
                    mercado = string.IsNullOrWhiteSpace(req.mercado) ? "AR" : req.mercado.Trim().ToUpperInvariant(),
                    moneda = string.IsNullOrWhiteSpace(req.moneda) ? "ARS" : req.moneda.Trim().ToUpperInvariant()
                }
            };

            var saNew = new ef_scope_addons
            {
                scope = "CUENTA",
                id_cuenta = idCuenta,
                id_evento = null,
                id_addon = req.id_addon,
                estado = "PENDIENTE",
                activo = true,
                fecha_desde = now,
                fecha_hasta = null,
                fecha_alta = now,
                fecha_modif = null,
                config_json_override = JsonSerializer.Serialize(meta)
            };

            _context.Set<ef_scope_addons>().Add(saNew);
            await _context.SaveChangesAsync();

            return Ok(new AddonSolicitudResponseDTO
            {
                ok = true,
                id_scope_addon = saNew.id_scope_addon,
                estado = saNew.estado
            });
        }
    }
}