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
    [Route("[controller]")]
    public class ANT_EstadoTramiteController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_EstadoTramites> _serviceGenerico;

        public ANT_EstadoTramiteController(DataContext context, ILogger<ANT_EstadoTramites> logger, ICRUDService<ANT_EstadoTramites> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_EstadoTramites>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_EstadoTramites>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ANT_EstadoTramites estado)
        {
            await _serviceGenerico.Add(estado);
            return Ok(estado);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ANT_EstadoTramites>> Update([FromBody] ANT_EstadoTramites estado)
        {
            await _serviceGenerico.Update(estado);
            return Ok(estado);
        }
    }
}
