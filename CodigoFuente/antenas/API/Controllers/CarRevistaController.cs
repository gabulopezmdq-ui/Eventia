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
    //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class CarRevistaController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_CarRevista> _serviceGenerico;

        public CarRevistaController(DataContext context, ILogger<MEC_CarRevista> logger, ICRUDService<MEC_CarRevista> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_CarRevista>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_CarRevista>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<MEC_CarRevista>> Get(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_CarRevista carRevista)
        {
            await _serviceGenerico.Add(carRevista);
            return Ok(carRevista);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_CarRevista>> Update([FromBody] MEC_CarRevista carRevista)
        {
            await _serviceGenerico.Update(carRevista);
            return Ok(carRevista);
        }

    }
}
