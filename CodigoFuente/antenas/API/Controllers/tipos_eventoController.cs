using  API.DataSchema;
using API.DataSchema.DTO;
using  API.Services;
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
    public class tipos_eventoController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_tipos_evento> _serviceGenerico;
        private readonly ILogger<tipos_eventoController> _logger;
        private readonly IParametricaService _parametricaService;


        public tipos_eventoController(DataContext context, ILogger<tipos_eventoController> logger, ICRUDService<ef_tipos_evento> serviceGenerico, IParametricaService parametricaService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _parametricaService = parametricaService;
        }

        //[Authorize(Roles = "SUPERADMIN")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetAll(
            [FromQuery] short idIdioma)
        {
            var result = await _parametricaService.GetAsync(
                "TIPO_EVENTO",
                idIdioma);

            return Ok(result);
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_tipos_evento>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_tipos_evento>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<ef_usuarios>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.codigo == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_tipos_evento tipo_evento)
        {
            await _serviceGenerico.Add(tipo_evento);
            return Ok(tipo_evento);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_tipos_evento>> Update([FromBody] ef_tipos_evento tipo_evento)
        {
            await _serviceGenerico.Update(tipo_evento);
            return Ok(tipo_evento);
        }

    }
}
