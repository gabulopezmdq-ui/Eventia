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
    [AllowAnonymous]
    [Route("[controller]")]
    public class cuentasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_cuentas> _serviceGenerico;
        private readonly ILogger<cuentasController> _logger;

        public cuentasController(DataContext context, ILogger<cuentasController> logger, ICRUDService<ef_cuentas> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        //[Authorize(Roles = "SUPERADMIN")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ef_cuentas>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_cuentas>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_cuentas>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<ef_usuarios>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_cuentas cuenta)
        {
            await _serviceGenerico.Add(cuenta);
            return Ok(cuenta);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_cuentas>> Update([FromBody] ef_cuentas cuenta)
        {
            await _serviceGenerico.Update(cuenta);
            return Ok(cuenta);
        }

    }
}
