using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles ="Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class ANT_InspeccionesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_Inspecciones> _serviceGenerico;

        public ANT_InspeccionesController(DataContext context, ILogger<ANT_Inspecciones> logger, ICRUDService<ANT_Inspecciones> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_Inspecciones>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_Inspecciones>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }


        [HttpGet("GetByCellId")]
        public async Task<ActionResult<IEnumerable<ANT_Inspecciones>>> GetByCelldId(string? cellId)
        {
            if(string.IsNullOrEmpty(cellId)) 
            {
                return BadRequest("CellId no puede ser Null ni estar vacío");
            }

            var inspecciones = await _serviceGenerico.GetByParam(a => a.Antena != null && a.Antena.CellId== cellId);
            
            if(inspecciones == null || !inspecciones.Any())
            {
                return NotFound("No se han encontrado Inspecciones con ese CellId");
            }

            return Ok(inspecciones);
        }


        //[HttpGet("GetByName")]
        //public async Task<ActionResult<ANT_Inspecciones>> Get(string Nombre)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(a => a.IdUsuario == Name));
        //}

        [HttpGet("GetByFecha")]
        public async Task<ActionResult<IEnumerable<ANT_Inspecciones>>> GetByFecha(DateTime Fecha)
        {
            return Ok(await _serviceGenerico.GetByParam(a => a.Fecha == Fecha));
        }


        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ANT_Inspecciones inspeccion)
        {
            await _serviceGenerico.Add(inspeccion);
            return Ok(inspeccion);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ANT_Inspecciones>> Update([FromBody] ANT_Inspecciones inspeccion)
        {
            await _serviceGenerico.Update(inspeccion);
            return Ok(inspeccion);
        }
    }
}
