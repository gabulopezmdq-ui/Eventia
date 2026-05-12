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
    public class paisesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_paises> _serviceGenerico;
        private readonly ILogger<paisesController> _logger;
        private readonly IParametricaService _parametricaService;

        public paisesController(
            DataContext context,
            ILogger<paisesController> logger,
            ICRUDService<ef_paises> serviceGenerico,
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
            var result = await _parametricaService.GetPaisesAsync(idIdioma);
            return Ok(result);
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_paises>>> GetByVigente([FromQuery] string? activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_paises>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<ef_paises>>> Search(
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
        public async Task<ActionResult> Post([FromBody] ef_paises pais)
        {
            await _serviceGenerico.Add(pais);
            return Ok(pais);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(short Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_paises>> Update([FromBody] ef_paises pais)
        {
            await _serviceGenerico.Update(pais);
            return Ok(pais);
        }
    }
}
