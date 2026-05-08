using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class hospedaje_tagsController : ControllerBase
    {
        private readonly IHospedajeTagsService _service;

        public hospedaje_tagsController(IHospedajeTagsService service)
        {
            _service = service;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ParametricaDTO>>> GetAll([FromQuery] short idIdioma)
        {
            var result = await _service.GetAllAsync(idIdioma);
            return Ok(result);
        }
    }
}
