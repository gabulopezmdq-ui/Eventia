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
    public class dress_codeController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_dress_code> _serviceGenerico;
        private readonly ILogger<dress_codeController> _logger;
        private readonly IParametricaService _parametricaService;

        public dress_codeController(DataContext context, ILogger<dress_codeController> logger, ICRUDService<ef_dress_code> serviceGenerico, IParametricaService parametricaService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _parametricaService = parametricaService;
        }

        //[Authorize(Roles = "SUPERADMIN")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetAll([FromQuery] short idIdioma)
        {
            var result = await _parametricaService.GetDressCodeAsync(idIdioma);
            return Ok(result);

        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_dress_code>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_dress_code>> Get(short Id)
        {
            return Ok(await _serviceGenerico.GetByIDShort(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<ef_usuarios>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_dress_code dresscode)
        {
            await _serviceGenerico.Add(dresscode);
            return Ok(dresscode);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_dress_code>> Update([FromBody] ef_dress_code dresscode)
        {
            await _serviceGenerico.Update(dresscode);
            return Ok(dresscode);
        }

    }
}
