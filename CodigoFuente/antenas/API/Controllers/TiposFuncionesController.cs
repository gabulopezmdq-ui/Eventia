using  API.DataSchema;
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
    //[AllowAnonymous]
    [Route("[controller]")]
    public class TiposFuncionesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_TiposFunciones> _serviceGenerico;

        public TiposFuncionesController(DataContext context, ILogger<MEC_TiposFunciones> logger, ICRUDService<MEC_TiposFunciones> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_TiposFunciones>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [Authorize(Roles = "SuperAdmin, Admin")]
        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_CarRevista>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_TiposFunciones>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<MEC_TiposFunciones>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_TiposFunciones tiposFunciones)
        {
            await _serviceGenerico.Add(tiposFunciones);
            return Ok(tiposFunciones);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_TiposFunciones>> Update([FromBody] MEC_TiposFunciones tiposFunciones)
        {
            await _serviceGenerico.Update(tiposFunciones);
            return Ok(tiposFunciones);
        }

    }
}
