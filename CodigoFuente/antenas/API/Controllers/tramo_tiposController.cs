using API.DataSchema;
using API.DataSchema.DTO;
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
    [AllowAnonymous]
    [Route("[controller]")]
    public class tramo_tiposController : ControllerBase
    {
        private readonly ICRUDService<ef_tramo_tipos> _serviceGenerico;
        private readonly ILogger<tramo_tiposController> _logger;
        private readonly IParametricaService _parametricaService;

        public tramo_tiposController(ILogger<tramo_tiposController> logger, ICRUDService<ef_tramo_tipos> serviceGenerico, IParametricaService parametricaService)
        {
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _parametricaService = parametricaService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetAll([FromQuery] short idIdioma)
        {
            var result = await _parametricaService.GetTramosTipoAsync(idIdioma);
            return Ok(result);

        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_tramo_tipos>>> GetByVigente([FromQuery] string? activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_tramo_tipos>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        [HttpGet("GetByCodigo")]
        public async Task<ActionResult<ef_tramo_tipos>> Get(string codigo)
        {
            return Ok(await _serviceGenerico.GetByParam(x => x.codigo == codigo));
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<ef_tramo_tipos>>> Search(
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
        public async Task<ActionResult> Post([FromBody] ef_tramo_tipos item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_tramo_tipos>> Update([FromBody] ef_tramo_tipos item)
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
