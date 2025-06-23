using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class MovimientosCabeceraController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_MovimientosCabecera> _serviceGenerico;
        private readonly ICRUDService<MEC_MovimientosDetalle> _serviceDetalle;
        private readonly IMovimientosService _movimientosDetalle;

        public MovimientosCabeceraController(DataContext context, ILogger<MEC_MovimientosCabecera> logger, ICRUDService<MEC_MovimientosCabecera> serviceGenerico, Services.IMovimientosService movimientosDetalle, ICRUDService<MEC_MovimientosDetalle> serviceDetalle)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _movimientosDetalle = movimientosDetalle;
            _serviceDetalle = serviceDetalle;
        }

        [HttpGet("BuscarSuplente")]
        public async Task<IActionResult> BuscarSuplente([FromQuery] string numDoc)
        {
            var resultado = await _movimientosDetalle.BuscarSuplente(numDoc);

            if (resultado == null)
            {
                return Conflict(new
                {
                    status = 404,
                    mensaje = "No se encontró un suplente con SitRevista 21. No se puede continuar con el proceso."
                });
            }

            return Ok(resultado);
        }

        public async Task<IActionResult> CalcularAntiguedad(int id)
        {
            var resultado = await _movimientosDetalle.CalcularAntiguedadAsync(id);

            if (!resultado.Success)
                return BadRequest(resultado.Message);

            return Ok(new
            {
                AntigAnios = resultado.Anio,
                AntigMeses = resultado.Mes
            });
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_MovimientosCabecera>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_MovimientosCabecera>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_MovimientosCabecera>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost("CabeceraMovimiento")]
        public async Task<ActionResult> Post([FromBody] MEC_MovimientosCabecera movimientos)
        {
            await _movimientosDetalle.CrearMovimientoCabeceraAsync(movimientos);
            return Ok(movimientos);
        }

        [HttpPost("AddDetalle")]
        public async Task<ActionResult> Post([FromBody] MEC_MovimientosDetalle movimientos)
        {
            await _serviceDetalle.Add(movimientos);
            return Ok(movimientos);
        }

        [HttpPost("EnviarProv")]
        public async Task<ActionResult> EnviarProv([FromBody] MEC_MovimientosCabecera movimiento)
        {
            var resultado = await _movimientosDetalle.EnviarProv(movimiento);

            if (!resultado)
                return NotFound("Movimiento no encontrado");

            return Ok("Movimiento enviado correctamente.");
        }
        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_MovimientosCabecera>> Update([FromBody] MEC_MovimientosCabecera estab)
        {
            await _serviceGenerico.Update(estab);
            return Ok(estab);
        }

    }
}
