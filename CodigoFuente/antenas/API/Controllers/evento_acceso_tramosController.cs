using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
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

        [HttpGet("GetByEvento")]
        public async Task<IActionResult> GetByEvento([FromQuery] long idEvento)
        {
            var data = await _context.ef_evento_acceso_tramos
                .Include(x => x.acceso)
                .Include(x => x.tramo)
                .AsNoTracking()
                .ToListAsync();

            // Filtra por evento (desde las relaciones)
            data = data.FindAll(x => x.acceso != null && x.acceso.id_evento == idEvento);

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ef_evento_acceso_tramos item)
        {
            _context.ef_evento_acceso_tramos.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] long idAcceso, [FromQuery] long idTramo)
        {
            var entity = await _context.ef_evento_acceso_tramos
                .FirstOrDefaultAsync(x => x.id_acceso == idAcceso && x.id_tramo == idTramo);

            if (entity == null) return NotFound();

            _context.ef_evento_acceso_tramos.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
