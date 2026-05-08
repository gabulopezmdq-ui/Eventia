using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class tipos_identificacion_fiscalController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_tipos_identificacion_fiscal> _serviceGenerico;
        private readonly ILogger<tipos_identificacion_fiscalController> _logger;
        private readonly IParametricaService _parametricaService;

        public tipos_identificacion_fiscalController(
            DataContext context,
            ILogger<tipos_identificacion_fiscalController> logger,
            ICRUDService<ef_tipos_identificacion_fiscal> serviceGenerico,
            IParametricaService parametricaService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _parametricaService = parametricaService;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetAll([FromQuery] short idIdioma)
        {
            var result = await _parametricaService.GetTiposIdentificacionFiscalAsync(idIdioma);
            return Ok(result);
        }

        [HttpGet("GetByPais")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetByPais([FromQuery] short idPais, [FromQuery] short idIdioma)
        {
            var result = await _parametricaService.GetTiposIdentificacionFiscalByPaisAsync(idPais, idIdioma);
            return Ok(result);
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_tipos_identificacion_fiscal>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_tipos_identificacion_fiscal>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<ef_tipos_identificacion_fiscal>>> Search(
            [FromQuery] string field,
            [FromQuery] string q = null,
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
        public async Task<ActionResult> Post([FromBody] ef_tipos_identificacion_fiscal tipoIdentificacionFiscal)
        {
            await _serviceGenerico.Add(tipoIdentificacionFiscal);
            return Ok(tipoIdentificacionFiscal);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(short Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_tipos_identificacion_fiscal>> Update([FromBody] ef_tipos_identificacion_fiscal tipoIdentificacionFiscal)
        {
            await _serviceGenerico.Update(tipoIdentificacionFiscal);
            return Ok(tipoIdentificacionFiscal);
        }
    }
}
