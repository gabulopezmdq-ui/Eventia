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
    [Authorize]
    [Route("[controller]")]
    public class evento_accesosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_accesosController> _logger;

        public evento_accesosController(DataContext context, ILogger<evento_accesosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /evento_accesos/ByEvento?idEvento=10
        [HttpGet("ByEvento")]
        public async Task<IActionResult> ByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            var list = await _context.Set<ef_evento_accesos>()
                .AsNoTracking()
                .Where(a => a.id_evento == idEvento)
                .OrderBy(a => a.orden)
                .ToListAsync();

            return Ok(list);
        }

        // PUT /evento_accesos/702
        [HttpPut("{idAcceso:long}")]
        public async Task<IActionResult> Update(long idAcceso, [FromBody] EventoAccesoUpdateRequestDTO req)
        {
            var ent = await _context.Set<ef_evento_accesos>()
                .SingleOrDefaultAsync(x => x.id_acceso == idAcceso);

            if (ent == null) return NotFound();

            long idUsuario = User.GetUserId();
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == ent.id_evento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            ent.nombre = req.nombre.Trim();
            ent.mensaje_rsvp = string.IsNullOrWhiteSpace(req.mensaje_rsvp) ? null : req.mensaje_rsvp.Trim();
            ent.orden = req.orden;
            ent.activo = req.activo;
            ent.fecha_modif = System.DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(ent);
        }
    }
}