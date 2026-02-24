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
    [AllowAnonymous]
    [Route("[controller]")]
    public class evento_musica_momentosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_evento_musica_momentos> _serviceGenerico;
        private readonly ILogger<evento_musica_momentosController> _logger;

        public evento_musica_momentosController(DataContext context, ILogger<evento_musica_momentosController> logger, ICRUDService<ef_evento_musica_momentos> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public ActionResult<IEnumerable<ef_evento_musica_momentos>> GetAll()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_evento_musica_momentos>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_evento_musica_momentos item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_evento_musica_momentos>> Update([FromBody] ef_evento_musica_momentos item)
        {
            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }
    }
}