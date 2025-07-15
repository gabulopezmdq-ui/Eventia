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
    [Authorize(Roles = "SuperAdmin, Admin, Secretario")]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class EstablecimientosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_Establecimientos> _serviceGenerico;

        public EstablecimientosController(DataContext context, ILogger<MEC_Establecimientos> logger, ICRUDService<MEC_Establecimientos> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_Establecimientos>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_CarRevista>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_Establecimientos>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<MEC_Establecimientos>> Get(string Name)
        {
        //    var conceptos = await _serviceGenerico.GetByParam(u => u.Descripcion == Name);
        //    var ordenar = conceptos.OrderBy( u => u.Descripcion).ToList();
            return Ok(await _serviceGenerico.GetByParam(u => u.NombrePcia == Name));
        }

        [HttpGet("GetByNroDiegep")]
        public async Task<ActionResult<MEC_Establecimientos>> GetCod(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.NroDiegep == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_Establecimientos estab)
        {
            await _serviceGenerico.Add(estab);
            return Ok(estab);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_Establecimientos>> Update([FromBody] MEC_Establecimientos estab)
        {
            await _serviceGenerico.Update(estab);
            return Ok(estab);
        }

    }
}
