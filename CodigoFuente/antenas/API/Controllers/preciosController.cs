using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using API.Services.Precios;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SUPERADMIN")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class preciosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_precios> _serviceGenerico;
        private readonly ILogger<preciosController> _logger;
        private readonly IPreciosService _preciosService;

        public preciosController(DataContext context, ILogger<preciosController> logger, ICRUDService<ef_precios> serviceGenerico, IPreciosService preciosService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _preciosService = preciosService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ef_precios>>> GetAll()
        {
            var result =  _serviceGenerico.GetAll();
            return Ok(result);
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_precios>>> GetByVigente([FromQuery] string? activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_precios>> Get([FromQuery] long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<ef_precios>>> Search(
            [FromQuery] string field,
            [FromQuery] string? q = null,
            [FromQuery] string modo = "contains",
            [FromQuery] bool? activo = null)
        {
            try
            {
                var result = await _serviceGenerico.SearchStringAsync(field, q, modo, activo);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_precios item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_precios>> Update([FromBody] ef_precios item)
        {
            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        // GET /precios/planes?tipo=B2C&mercado=AR
        [HttpGet("planes")]
        public async Task<ActionResult> GetPlanesPublicos(
            [FromQuery] string tipo = "B2C",
            [FromQuery] string mercado = "AR")
        {
            try
            {
                var datos = await _preciosService.GetPlanesAsync(tipo, mercado);
                return Ok(datos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /precios/planes/B2C_PRO?mercado=AR
        [HttpGet("planes/{codigo_plan}")]
        public async Task<ActionResult> GetPrecioPlanPublico(
            string codigo_plan,
            [FromQuery] string mercado = "AR")
        {
            try
            {
                var dato = await _preciosService.GetPrecioPlanAsync(codigo_plan, mercado);
                return Ok(dato);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        //[HttpDelete]
        //public async Task<IActionResult> Delete([FromQuery] long Id)
        //{
        //    await _serviceGenerico.DeleteLong(Id);
        //    return Ok();
        //}
    }
}
