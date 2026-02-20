using API.DataSchema;
using API.DataSchema.DTO;
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
    //[AllowAnonymous]
    [Route("[controller]")]
    public class plantillas_eventoController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_plantillas_evento> _serviceGenerico;
        private readonly ILogger<plantillas_eventoController> _logger;

        public plantillas_eventoController(
            DataContext context,
            ILogger<plantillas_eventoController> logger,
            ICRUDService<ef_plantillas_evento> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_plantillas_evento>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_plantillas_evento>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        [HttpGet("GetByCodigo")]
        public async Task<ActionResult<ef_plantillas_evento>> Get(string codigo)
        {
            return Ok(await _serviceGenerico.GetByParam(x => x.codigo == codigo));
        }

        // ✅ ESTE ES EL QUE TE FALTABA PARA LAS CARDS
        // GET /plantillas_evento/GetByTipo?idTipoEvento=3&activo=true
        [HttpGet("GetByTipo")]
        public async Task<ActionResult<IEnumerable<ef_plantillas_evento>>> GetByTipo([FromQuery] int idTipoEvento, [FromQuery] string activo = null)
        {
            bool? activoBool = null;
            if (!string.IsNullOrWhiteSpace(activo))
            {
                var a = activo.Trim().ToLowerInvariant();
                activoBool = (a == "true" || a == "1" || a == "t");
            }

            var list = await _context.Set<ef_plantillas_evento>()
                .AsNoTracking()
                .Where(p => p.id_tipo_evento == idTipoEvento && (activoBool == null || p.activo == activoBool.Value))
                .OrderBy(p => p.id_plantilla)
                .ToListAsync();

            return Ok(list);
        }

        // ✅ DETALLE PARA ARMAR CARDS BIEN (tramos/accesos/relaciones)
        // GET /plantillas_evento/2/Detalle
        [HttpGet("{idPlantilla:int}/Detalle")]
        public async Task<ActionResult<PlantillaDetalleDTO>> Detalle(short idPlantilla)
        {
            var p = await _context.Set<ef_plantillas_evento>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_plantilla == idPlantilla);

            if (p == null) return NotFound();

            var tramos = await _context.Set<ef_plantilla_tramos>()
                .AsNoTracking()
                .Where(x => x.id_plantilla == idPlantilla)
                .OrderBy(x => x.orden)
                .Select(x => new PlantillaTramoItemDTO
                {
                    id_plantilla_tramo = x.id_plantilla_tramo,
                    id_tramo_tipo = x.id_tramo_tipo,
                    nombre_default = x.nombre_default,
                    leyenda_default = x.leyenda_default,
                    orden = x.orden,
                    activo = x.activo
                })
                .ToListAsync();

            var accesos = await _context.Set<ef_plantilla_accesos>()
                .AsNoTracking()
                .Where(x => x.id_plantilla == idPlantilla)
                .OrderBy(x => x.orden)
                .Select(x => new PlantillaAccesoItemDTO
                {
                    id_plantilla_acceso = x.id_plantilla_acceso,
                    nombre_default = x.nombre_default,
                    mensaje_rsvp_default = x.mensaje_rsvp_default,
                    es_publico_default = x.es_publico_default,
                    orden = x.orden,
                    es_default = x.es_default,
                    activo = x.activo
                })
                .ToListAsync();

            var relaciones = await _context.Set<ef_plantilla_acceso_tramos>()
                .AsNoTracking()
                .Where(x => x.plantilla_acceso.id_plantilla == idPlantilla)
                .Select(x => new PlantillaRelacionItemDTO
                {
                    id_plantilla_acceso = x.id_plantilla_acceso,
                    id_plantilla_tramo = x.id_plantilla_tramo
                })
                .ToListAsync();

            var dto = new PlantillaDetalleDTO
            {
                id_plantilla = p.id_plantilla,
                id_tipo_evento = p.id_tipo_evento ?? 0,
                codigo = p.codigo,
                nombre = CodigoToNombre(p.codigo),
                activo = p.activo,
                tramos = tramos,
                accesos = accesos,
                relaciones = relaciones
            };

            return Ok(dto);
        }

        private static string CodigoToNombre(string codigo)
        {
            if (string.IsNullOrWhiteSpace(codigo)) return codigo;
            var txt = codigo.Replace("_", " ").ToLowerInvariant();
            return string.Join(" ", txt.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(w => char.ToUpperInvariant(w[0]) + w.Substring(1)));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_plantillas_evento item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_plantillas_evento>> Update([FromBody] ef_plantillas_evento item)
        {
            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }


    }


}