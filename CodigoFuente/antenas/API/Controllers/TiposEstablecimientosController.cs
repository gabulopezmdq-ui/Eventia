using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SuperAdmin, Admin")]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class TiposEstablecimientosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_TiposEstablecimientos> _serviceGenerico;

        public TiposEstablecimientosController(DataContext context, ILogger<MEC_TiposEstablecimientos> logger, ICRUDService<MEC_TiposEstablecimientos> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_TiposEstablecimientos>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
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
        public async Task<ActionResult<MEC_TiposEstablecimientos>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByName")]
        public async Task<ActionResult<MEC_TiposEstablecimientos>> Get(string Name)
        {
        //    var conceptos = await _serviceGenerico.GetByParam(u => u.Descripcion == Name);
        //    var ordenar = conceptos.OrderBy( u => u.Descripcion).ToList();
            return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        }

        [HttpGet("GetByCod")]
        public async Task<ActionResult<MEC_TiposEstablecimientos>> GetCod(string Name)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.CodTipoEstablecimiento == Name));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_TiposEstablecimientos tipoEstab)
        {
            await _serviceGenerico.Add(tipoEstab);
            return Ok(tipoEstab);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_TiposEstablecimientos>> Update([FromBody] MEC_TiposEstablecimientos tipoEstab)
        {
            await _serviceGenerico.Update(tipoEstab);
            return Ok(tipoEstab);
        }

    }
}
