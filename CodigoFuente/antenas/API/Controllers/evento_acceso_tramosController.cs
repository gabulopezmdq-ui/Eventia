using API.DataSchema;
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
    public class evento_acceso_tramosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_acceso_tramosController> _logger;

        public evento_acceso_tramosController(DataContext context, ILogger<evento_acceso_tramosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /evento_acceso_tramos/GetByEvento?idEvento=10
        [HttpGet("GetByEvento")]
        public async Task<IActionResult> GetByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            var data = await _context.ef_evento_acceso_tramos
                .AsNoTracking()
                .Where(x => x.acceso.id_evento == idEvento)
                .Select(x => new
                {
                    x.id_acceso,
                    x.id_tramo
                })
                .ToListAsync();

            return Ok(data);
        }

        // POST /evento_acceso_tramos
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ef_evento_acceso_tramos item)
        {
            // validar pertenencia por acceso
            var acceso = await _context.Set<ef_evento_accesos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(a => a.id_acceso == item.id_acceso);

            if (acceso == null) return BadRequest("Acceso inexistente.");

            long idUsuario = User.GetUserId();
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == acceso.id_evento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            _context.ef_evento_acceso_tramos.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // DELETE /evento_acceso_tramos?idAcceso=702&idTramo=501
        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] long idAcceso, [FromQuery] long idTramo)
        {
            var entity = await _context.ef_evento_acceso_tramos
                .FirstOrDefaultAsync(x => x.id_acceso == idAcceso && x.id_tramo == idTramo);

            if (entity == null) return NotFound();

            // validar pertenencia por acceso
            var acceso = await _context.Set<ef_evento_accesos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(a => a.id_acceso == idAcceso);

            if (acceso == null) return BadRequest("Acceso inexistente.");

            long idUsuario = User.GetUserId();
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == acceso.id_evento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece) return Forbid();

            _context.ef_evento_acceso_tramos.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
