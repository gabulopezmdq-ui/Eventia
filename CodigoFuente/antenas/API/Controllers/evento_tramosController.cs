using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize] // ✅ no anonymous
    [Route("[controller]")]
    public class evento_tramosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_tramosController> _logger;

        public evento_tramosController(DataContext context, ILogger<evento_tramosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /evento_tramos/ByEvento?idEvento=10
        [HttpGet("ByEvento")]
        public async Task<IActionResult> ByEvento([FromQuery] long idEvento)
        {
            // (recomendado) validar pertenencia
            long idUsuario = User.GetUserId();
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            var list = await _context.Set<ef_evento_tramos>()
                .AsNoTracking()
                .Where(t => t.id_evento == idEvento)
                .OrderBy(t => t.orden)
                .ToListAsync();

            return Ok(list);
        }

        // PUT /evento_tramos/501
        [HttpPut("{idTramo:long}")]
        public async Task<IActionResult> Update(long idTramo, [FromBody] EventoTramoUpdateRequest req)
        {
            var ent = await _context.Set<ef_evento_tramos>()
                .SingleOrDefaultAsync(x => x.id_tramo == idTramo);

            if (ent == null) return NotFound();

            // validar pertenencia por evento
            long idUsuario = User.GetUserId();
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == ent.id_evento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            ent.nombre = req.nombre.Trim();
            ent.leyenda_visible = string.IsNullOrWhiteSpace(req.leyenda_visible) ? null : req.leyenda_visible.Trim();
            ent.fecha_hora_inicio = req.fecha_hora_inicio;
            ent.fecha_hora_fin = req.fecha_hora_fin;
            ent.lugar = string.IsNullOrWhiteSpace(req.lugar) ? null : req.lugar.Trim();
            ent.direccion = string.IsNullOrWhiteSpace(req.direccion) ? null : req.direccion.Trim();
            ent.latitud = req.latitud;
            ent.longitud = req.longitud;
            ent.orden = req.orden;
            ent.activo = req.activo;
            ent.fecha_modif = System.DateTimeOffset.UtcNow;

            // ✅ Sincronizar fecha del evento si se modifica el tramo 1
            if (ent.orden == 1)
            {
                var ev = await _context.Set<ef_eventos>().FindAsync(ent.id_evento);
                if (ev != null)
                {
                    ev.fecha_evento = ent.fecha_hora_inicio;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(ent);
        }
    }
}
