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
    [Authorize]
    [Route("[controller]")]
    public class evento_addonsController : ControllerBase
    {
        private readonly DataContext _context;

        public evento_addonsController(DataContext context)
        {
            _context = context;
        }

        // GET /evento_addons/GetByEvento?idEvento=16
        [HttpGet("GetByEvento")]
        public async Task<IActionResult> GetByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = User.IsStaff() || await _context.Set<ef_evento_usuarios>().AsNoTracking()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            var list = await (
                from sa in _context.Set<ef_scope_addons>().AsNoTracking()
                join ad in _context.Set<ef_addons>().AsNoTracking() on sa.id_addon equals ad.id_addon
                where sa.scope == "EVENTO"
                      && sa.id_evento == idEvento
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

        // POST /evento_addons/Solicitar?idEvento=16
        [HttpPost("Solicitar")]
        public async Task<ActionResult<AddonSolicitudResponseDTO>> Solicitar([FromQuery] long idEvento, [FromBody] AddonSolicitudRequestDTO req)
        {
            if (req.id_addon <= 0) return BadRequest("id_addon inválido.");

            long idUsuario = User.GetUserId();

            bool pertenece = User.IsStaff() || await _context.Set<ef_evento_usuarios>().AsNoTracking()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            var addon = await _context.Set<ef_addons>().AsNoTracking()
                .SingleOrDefaultAsync(a => a.id_addon == req.id_addon && a.activo == true);

            if (addon == null) return BadRequest("Addon inexistente o inactivo.");
            if (addon.scope != "EVENTO") return BadRequest("Este addon no es de scope EVENTO.");

            // ya existe solicitud o activo?
            bool existe = await _context.Set<ef_scope_addons>().AsNoTracking()
                .AnyAsync(sa => sa.scope == "EVENTO"
                                && sa.id_evento == idEvento
                                && sa.id_addon == req.id_addon
                                && sa.activo == true
                                && (sa.estado == "PENDIENTE" || sa.estado == "ACTIVO" || sa.estado == "SUSPENDIDO"));

            if (existe) return BadRequest("Ya existe una solicitud/contratación activa para este addon en el evento.");

            var now = DateTimeOffset.UtcNow;

            // guardo mercado/moneda solicitados en config_json_override (jsonb)
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
                scope = "EVENTO",
                id_evento = idEvento,
                id_cuenta = null,
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