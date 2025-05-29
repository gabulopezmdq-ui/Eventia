using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]

    public class TiposMovimientosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_TiposMovimientos> _serviceGenerico;

        public TiposMovimientosController(DataContext context,ICRUDService<MEC_TiposMovimientos> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }


        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_TiposMovimientos>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_TiposMovimientos>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_TiposMovimientos tipoMovimiento)
        {
            await _serviceGenerico.Add(tipoMovimiento);
            return Ok(tipoMovimiento);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_TiposMovimientos>> Update([FromBody] MEC_TiposMovimientos tipoMovimiento)
        {
            await _serviceGenerico.Update(tipoMovimiento);
            return Ok(tipoMovimiento);
        }
    }
}
