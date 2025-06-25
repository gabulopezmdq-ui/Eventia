using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class MovimientosBajaController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_MovimientosBajas> _serviceGenerico;
        private readonly IMovimientosService _movimientosDetalle;

        public MovimientosBajaController(DataContext context, ILogger<MEC_MovimientosBajas> logger, ICRUDService<MEC_MovimientosBajas> serviceGenerico, IMovimientosService movimientosDetalle)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _movimientosDetalle = movimientosDetalle;
        }

        [HttpGet("GetPOF")]
        public async Task<ActionResult> ObtenerPOF(int idEstablecimiento)
        {
            var pofList = await _movimientosDetalle.ObtenerPOFPorEstablecimientoAsync(idEstablecimiento);

            if (pofList == null || !pofList.Any())
                return NotFound("No se encontraron cargos POF para el establecimiento.");

            return Ok(pofList);
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_MovimientosBajas>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_MovimientosBajas>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_MovimientosBajas>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_MovimientosBajas baja)
        {
            await _serviceGenerico.Add(baja);
            return Ok(baja);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_MovimientosBajas>> Update([FromBody] MEC_MovimientosBajas baja)
        {
            await _serviceGenerico.Update(baja);
            return Ok(baja);
        }

    }
}
