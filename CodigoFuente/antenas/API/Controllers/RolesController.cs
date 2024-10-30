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
    [Authorize(Roles = "SuperAdmin")]
    //[AllowAnonymous]
    [Route("Roles")]
    public class RolesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_Roles> _serviceGenerico;

        public RolesController(DataContext context, ILogger<MEC_Roles> logger, ICRUDService<MEC_Roles> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_Roles>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_Roles>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_Roles rol)
        {
            await _serviceGenerico.Add(rol);
            return Ok(rol);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_Roles>> Update([FromBody] MEC_Roles rol)
        {
            await _serviceGenerico.Update(rol);
            return Ok(rol);
        }

    }
}
