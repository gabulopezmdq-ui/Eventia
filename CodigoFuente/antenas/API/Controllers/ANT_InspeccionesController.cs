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
    public class ANT_InspeccionesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_Inspecciones> _serviceGenerico;

        public ANT_InspeccionesController(DataContext context, ILogger<ANT_Inspecciones> logger, ICRUDService<ANT_Inspecciones> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_Inspecciones>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_Inspecciones>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromForm] ANT_Inspecciones inspeccion)
        {
            await _serviceGenerico.Add(inspeccion);
            return Ok(inspeccion);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ANT_Inspecciones>> Update([FromBody] ANT_Inspecciones inspeccion)
        {
            await _serviceGenerico.Update(inspeccion);
            return Ok(inspeccion);
        }
    }
}
