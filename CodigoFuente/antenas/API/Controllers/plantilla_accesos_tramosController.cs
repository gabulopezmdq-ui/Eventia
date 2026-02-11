using  API.DataSchema;
using API.DataSchema.DTO;
using  API.Services;
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
    public class plantilla_acceso_tramosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<plantilla_acceso_tramosController> _logger;

        public plantilla_acceso_tramosController(DataContext context, ILogger<plantilla_acceso_tramosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("GetByPlantilla")]
        public async Task<IActionResult> GetByPlantilla([FromQuery] short idPlantilla)
        {
            var data = await _context.ef_plantilla_acceso_tramos
                .AsNoTracking()
                .Include(x => x.plantilla_acceso)
                .Include(x => x.plantilla_tramo)
                .Where(x => x.plantilla_acceso != null && x.plantilla_acceso.id_plantilla == idPlantilla)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("GetTramosByAcceso")]
        public async Task<IActionResult> GetTramosByAcceso([FromQuery] long idPlantillaAcceso)
        {
            var data = await _context.ef_plantilla_acceso_tramos
                .AsNoTracking()
                .Include(x => x.plantilla_tramo)
                .Where(x => x.id_plantilla_acceso == idPlantillaAcceso)
                .Select(x => x.plantilla_tramo)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("GetAccesosByTramo")]
        public async Task<IActionResult> GetAccesosByTramo([FromQuery] long idPlantillaTramo)
        {
            var data = await _context.ef_plantilla_acceso_tramos
                .AsNoTracking()
                .Include(x => x.plantilla_acceso)
                .Where(x => x.id_plantilla_tramo == idPlantillaTramo)
                .Select(x => x.plantilla_acceso)
                .ToListAsync();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ef_plantilla_acceso_tramos item)
        {
            _context.ef_plantilla_acceso_tramos.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] long idPlantillaAcceso, [FromQuery] long idPlantillaTramo)
        {
            var entity = await _context.ef_plantilla_acceso_tramos
                .FirstOrDefaultAsync(x => x.id_plantilla_acceso == idPlantillaAcceso && x.id_plantilla_tramo == idPlantillaTramo);

            if (entity == null) return NotFound();

            _context.ef_plantilla_acceso_tramos.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
