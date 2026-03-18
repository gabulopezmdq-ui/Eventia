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
    [Route("admin/prospectos_b2b")]
    public class admin_prospectos_b2bController : ControllerBase
    {
        private readonly DataContext _context;

        public admin_prospectos_b2bController(DataContext context)
        {
            _context = context;
        }

        // GET /admin/prospectos_b2b/Pendientes
        [HttpGet("Pendientes")]
        public async Task<IActionResult> Pendientes()
        {
            var list = await (
                from p in _context.Set<ef_b2b_prospectos>().AsNoTracking()

                    // LEFT JOIN usuarios asignados (puede ser null)
                join u in _context.Set<ef_usuarios>().AsNoTracking()
                    on p.id_usuario_asignado equals u.id_usuario into uJ
                from u in uJ.DefaultIfEmpty()

                where p.activo == true &&
                      (p.estado == "NUEVO" || p.estado == "CONTACTADO" || p.estado == "CALIFICADO")

                orderby (p.proximo_contacto == null), p.proximo_contacto, p.fecha_alta descending

                select new ProspectoB2BPendienteGridDTO
                {
                    id_prospecto = p.id_prospecto,
                    fecha_alta = p.fecha_alta,

                    estado = p.estado,
                    empresa_nombre = p.empresa_nombre,
                    nombre_apellido = p.nombre_apellido,
                    ciudad = p.ciudad,
                    pais = p.pais,

                    whatsapp = p.whatsapp,
                    email = p.email,
                    eventos_por_mes = p.eventos_por_mes,

                    proximo_contacto = p.proximo_contacto,

                    id_usuario_asignado = p.id_usuario_asignado,

                    asignado_nombre = (u != null ? (u.nombre + " " + u.apellido) : null),
                    asignado_email = (u != null ? u.email : null)
                }
            ).ToListAsync();

            return Ok(list);
        }

        // GET /admin/prospectos_b2b/Historial?idProspecto=101
        [HttpGet("Historial")]
        public async Task<IActionResult> Historial([FromQuery] long idProspecto)
        {
            var list = await _context.Set<ef_b2b_prospectos_hist>()
                .AsNoTracking()
                .Where(h => h.id_prospecto == idProspecto)
                .OrderByDescending(h => h.fecha)
                .ToListAsync();

            return Ok(list);
        }

        // POST /admin/prospectos_b2b/AgregarNota?idProspecto=101
        [HttpPost("AgregarNota")]
        public async Task<IActionResult> AgregarNota([FromQuery] long idProspecto, [FromBody] ProspectoB2BHistAddDTO req)
        {
            if (string.IsNullOrWhiteSpace(req.detalle))
                return BadRequest("detalle obligatorio.");

            var row = await _context.Set<ef_b2b_prospectos>()
                .SingleOrDefaultAsync(x => x.id_prospecto == idProspecto);

            if (row == null) return NotFound("Prospecto inexistente.");

            var now = DateTimeOffset.UtcNow;
            long idAdmin = User.GetUserId();

            _context.Set<ef_b2b_prospectos_hist>().Add(new ef_b2b_prospectos_hist
            {
                id_prospecto = idProspecto,
                fecha = now,
                id_usuario = idAdmin,
                tipo = string.IsNullOrWhiteSpace(req.tipo) ? "NOTA" : req.tipo.Trim().ToUpperInvariant(),
                detalle = req.detalle,
                estado_nuevo = req.estado_nuevo,
                proximo_contacto = req.proximo_contacto
            });

            // si mandan estado_nuevo o proximo_contacto, lo reflejamos en la cabecera
            if (!string.IsNullOrWhiteSpace(req.estado_nuevo))
                row.estado = req.estado_nuevo.Trim().ToUpperInvariant();

            if (req.proximo_contacto.HasValue)
                row.proximo_contacto = req.proximo_contacto.Value;

            row.fecha_modif = now;

            await _context.SaveChangesAsync();
            return Ok(new { ok = true });
        }

        // PUT /admin/prospectos_b2b/Update?idProspecto=101
        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromQuery] long idProspecto, [FromBody] ProspectoB2BUpdateAdminDTO req)
        {
            var row = await _context.Set<ef_b2b_prospectos>()
                .SingleOrDefaultAsync(x => x.id_prospecto == idProspecto);

            if (row == null) return NotFound("Prospecto inexistente.");

            var now = DateTimeOffset.UtcNow;
            long idAdmin = User.GetUserId();

            string? cambio = null;

            if (req.estado != null) { row.estado = req.estado.Trim().ToUpperInvariant(); cambio = "CAMBIO_ESTADO"; }
            if (req.nota_interna != null) row.nota_interna = req.nota_interna;
            if (req.id_usuario_asignado.HasValue) { row.id_usuario_asignado = req.id_usuario_asignado.Value; cambio = "ASIGNACION"; }
            if (req.proximo_contacto.HasValue) { row.proximo_contacto = req.proximo_contacto.Value; cambio = cambio ?? "CONTACTO"; }
            if (req.activo.HasValue) row.activo = req.activo.Value;

            row.fecha_modif = now;

            // historial automático de update (si hubo algo relevante)
            if (cambio != null)
            {
                _context.Set<ef_b2b_prospectos_hist>().Add(new ef_b2b_prospectos_hist
                {
                    id_prospecto = idProspecto,
                    fecha = now,
                    id_usuario = idAdmin,
                    tipo = cambio,
                    detalle = "Actualización desde panel admin.",
                    estado_nuevo = req.estado != null ? row.estado : null,
                    proximo_contacto = req.proximo_contacto
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { ok = true });
        }
    }
}
