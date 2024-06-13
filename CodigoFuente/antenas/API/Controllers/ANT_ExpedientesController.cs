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
    public class ANT_ExpedientesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_Expedientes> _serviceGenerico;

        public ANT_ExpedientesController(DataContext context, ILogger<ANT_Expedientes> logger, ICRUDService<ANT_Expedientes> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_Expedientes>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_Expedientes>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromForm] ANT_Expedientes expediente)
        {
            await _serviceGenerico.Add(expediente);
            return Ok(expediente);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ANT_Expedientes>> Update([FromBody] ANT_Expedientes expediente)
        {
            await _serviceGenerico.Update(expediente);
            return Ok(expediente);
        }
    }
}
