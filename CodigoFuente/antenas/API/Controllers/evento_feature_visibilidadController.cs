using API.DataSchema;
using API.DataSchema.DTO.Eventos.Features;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class evento_feature_visibilidadController : ControllerBase
    {
        private readonly DataContext _context;

        public evento_feature_visibilidadController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("GetByEvento")]
        public async Task<ActionResult<List<EventoFeatureVisibilidadDTO>>> GetByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            var evento = await _context.ef_eventos
                .Where(x => x.id_evento == idEvento)
                .Select(x => new
                {
                    x.id_evento,
                    x.tipo_operacion
                })
                .FirstOrDefaultAsync();

            if (evento == null)
                return BadRequest("No existe el evento.");

            bool esPrograma = string.Equals(evento.tipo_operacion, "PROGRAMA", StringComparison.OrdinalIgnoreCase);

            var data = await (
                from ef in _context.ef_evento_features
                join f in _context.ef_param_features
                    on ef.id_feature equals f.id_feature
                join v0 in _context.ef_evento_feature_visibilidad
                    on new { ef.id_evento, ef.id_feature }
                    equals new { v0.id_evento, v0.id_feature } into gj
                from v in gj.DefaultIfEmpty()
                where ef.id_evento == idEvento
                   && ef.activo == true
                   && f.activo == true
                orderby f.categoria, f.nombre
                select new
                {
                    ef.id_evento,
                    ef.id_feature,
                    f.codigo,
                    f.nombre,
                    activo_evento = ef.activo,

                    default_acceso = esPrograma
                        ? f.visible_acceso_programa_default
                        : f.visible_acceso_evento_default,

                    default_centro = esPrograma
                        ? f.visible_centro_programa_default
                        : f.visible_centro_evento_default,

                    visible_acceso = esPrograma
                        ? v.visible_acceso_programa
                        : v.visible_acceso_evento,

                    visible_centro = esPrograma
                        ? v.visible_centro_programa
                        : v.visible_centro_evento
                }
            ).ToListAsync();

            var result = data.Select(x => new EventoFeatureVisibilidadDTO
            {
                id_evento = x.id_evento,
                id_feature = x.id_feature,
                codigo = x.codigo,
                nombre = x.nombre,
                activo_evento = x.activo_evento,

                visible_acceso = x.visible_acceso ?? x.default_acceso,
                visible_centro = x.visible_centro ?? x.default_centro,

                permite_acceso = x.default_acceso,
                permite_centro = x.default_centro
            }).ToList();

            return Ok(result);
        }

        [HttpPut("SetBulk")]
        public async Task<IActionResult> SetBulk(
            [FromQuery] long idEvento,
            [FromBody] EventoFeatureVisibilidadBulkRequestDTO req)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            if (req == null || req.items == null || req.items.Count == 0)
                return BadRequest("items vacío.");

            var evento = await _context.ef_eventos
                .Where(x => x.id_evento == idEvento)
                .Select(x => new
                {
                    x.id_evento,
                    x.tipo_operacion
                })
                .FirstOrDefaultAsync();

            if (evento == null)
                return BadRequest("No existe el evento.");

            bool esPrograma = string.Equals(evento.tipo_operacion, "PROGRAMA", StringComparison.OrdinalIgnoreCase);

            var ids = req.items.Select(x => x.id_feature).Distinct().ToList();

            var featuresActivas = await _context.ef_evento_features
                .Where(x => x.id_evento == idEvento && ids.Contains(x.id_feature) && x.activo == true)
                .Select(x => x.id_feature)
                .ToListAsync();

            var noActivas = ids.Except(featuresActivas).ToList();

            if (noActivas.Count > 0)
                return BadRequest(new { error = "Hay features no activas para el evento.", ids = noActivas });

            foreach (var item in req.items)
            {
                var row = await _context.ef_evento_feature_visibilidad
                    .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_feature == item.id_feature);

                if (row == null)
                {
                    row = new ef_evento_feature_visibilidad
                    {
                        id_evento = idEvento,
                        id_feature = item.id_feature,
                        fecha_alta = DateTime.UtcNow
                    };

                    _context.ef_evento_feature_visibilidad.Add(row);
                }

                if (esPrograma)
                {
                    row.visible_acceso_programa = item.visible_acceso;
                    row.visible_centro_programa = item.visible_centro;
                }
                else
                {
                    row.visible_acceso_evento = item.visible_acceso;
                    row.visible_centro_evento = item.visible_centro;
                }

                row.fecha_modif = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_evento = idEvento, updated = req.items.Count });
        }
    }
}