using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles ="Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class ANT_PrestadoresController :ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ANT_Prestadores> _serviceGenerico;

        public ANT_PrestadoresController(DataContext context, ILogger<ANT_Prestadores> logger, ICRUDService<ANT_Prestadores> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ANT_Prestadores>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ANT_Prestadores>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByNombre")]

        public async Task<ActionResult<ANT_Prestadores>> Get(string? Nombre)
        {
            return Ok(await _serviceGenerico.GetByParam(a => a.RazonSocial == Nombre));
        }

        [HttpGet("GetByCuit")]

        public async Task<ActionResult<ANT_Prestadores>> Get(int? Cuit)
        {
            return Ok(await _serviceGenerico.GetByParam(a => a.Cuit == Cuit));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ANT_Prestadores prestador)
        {
            await _serviceGenerico.Add(prestador);
            return Ok(prestador);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ANT_Prestadores>> Update([FromBody] ANT_Prestadores prestador)
        {
            await _serviceGenerico.Update(prestador);
            return Ok(prestador);
        }
    }
}
