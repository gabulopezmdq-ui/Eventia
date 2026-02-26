using API.DataSchema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class param_entidadesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<param_entidadesController> _logger;

        public param_entidadesController(DataContext context, ILogger<param_entidadesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("GetAll")]
        [Authorize(Roles = "SUPERADMIN")]
        public async Task<ActionResult<List<ef_param_entidades>>> GetAll([FromQuery] bool? activo = null)
        {
            var q = _context.ef_param_entidades.AsQueryable();

            if (activo.HasValue)
                q = q.Where(x => x.activo == activo.Value);

            var data = await q
                .OrderBy(x => x.grupo_menu)
                .ThenBy(x => x.orden_menu)
                .ThenBy(x => x.descripcion)
                .ToListAsync();

            return Ok(data);
        }

        // GET /param_entidades/GetById?entidad=TIPO_EVENTO
        [HttpGet("GetById")]
        public async Task<ActionResult<ef_param_entidades>> GetById([FromQuery] string entidad)
        {
            entidad = (entidad ?? "").Trim().ToUpperInvariant();
            var db = await _context.ef_param_entidades.FirstOrDefaultAsync(x => x.entidad == entidad);
            if (db == null) return NotFound();
            return Ok(db);
        }

        // PUT /param_entidades  (edición de metadatos)
        [HttpPut]
        public async Task<ActionResult> Update([FromBody] ef_param_entidades model)
        {
            if (model == null) return BadRequest();

            var entidad = (model.entidad ?? "").Trim().ToUpperInvariant();
            var db = await _context.ef_param_entidades.FirstOrDefaultAsync(x => x.entidad == entidad);
            if (db == null) return NotFound();

            if (!db.editable_por_superadmin)
                return Conflict("Entidad no editable.");

            db.descripcion = model.descripcion?.Trim() ?? db.descripcion;
            db.grupo_menu = model.grupo_menu?.Trim() ?? db.grupo_menu;
            db.orden_menu = model.orden_menu;

            db.requiere_traducciones = model.requiere_traducciones;
            db.requiere_es_ar = model.requiere_es_ar;
            db.requiere_todos_idiomas = model.requiere_todos_idiomas;
            db.usa_orden = model.usa_orden;

            db.fallback_locale = model.fallback_locale?.Trim() ?? db.fallback_locale;
            db.max_len_texto = model.max_len_texto;

            db.ayuda_ui = model.ayuda_ui;
            db.activo = model.activo;

            await _context.SaveChangesAsync();
            return Ok(db);
        }
    }
}
