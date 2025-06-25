using API.DataSchema.DTO;
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
    //[Authorize(Roles = "SuperAdmin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class UsuariosEstablecimientosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_UsuariosEstablecimientos> _serviceGenerico;

        public UsuariosEstablecimientosController(DataContext context, ILogger<MEC_UsuariosEstablecimientos> logger, ICRUDService<MEC_UsuariosEstablecimientos> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_UsuariosEstablecimientos>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_UsuariosEstablecimientos>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_UsuariosEstablecimientos usuario)
        {
            await _serviceGenerico.Add(usuario);
            return Ok(usuario);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_UsuariosEstablecimientos>> Update([FromBody] MEC_UsuariosEstablecimientos usuario)
        {
            await _serviceGenerico.Update(usuario);
            return Ok(usuario);
        }
    }
}
