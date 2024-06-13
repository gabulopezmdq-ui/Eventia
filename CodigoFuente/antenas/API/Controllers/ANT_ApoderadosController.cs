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
    //[Authorize(Roles ="Admin")]
    [AllowAnonymous]
    [Route("Controller")]
    public class ANT_ApoderadosController :ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_Apoderados> _serviceGenerico;

        public ANT_ApoderadosController(DataContext context, ILogger<ANT_Apoderados> logger, ICRUDService<ANT_Apoderados> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_EstadoTramite>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_EstadoTramite>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromForm] ANT_Apoderados apoderado)
        {
            await _serviceGenerico.Add(apoderado);
            return Ok(apoderado);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ANT_Apoderados>> Update([FromBody] ANT_Apoderados apoderado)
        {
            await _serviceGenerico.Update(apoderado);
            return Ok(apoderado);
        }
    }
}
