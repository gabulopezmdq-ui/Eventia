using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SUPERADMIN")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class planesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_planes> _serviceGenerico;
        private readonly ILogger<planesController> _logger;

        public planesController(DataContext context, ILogger<planesController> logger, ICRUDService<ef_planes> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ef_planes>>> GetAll()
        {
            var result = _serviceGenerico.GetAll();
            return Ok(result);
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_planes>>> GetByVigente([FromQuery] string? activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_planes>> Get([FromQuery] long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<ef_planes>>> Search(
            [FromQuery] string field,
            [FromQuery] string? q = null,
            [FromQuery] string modo = "contains",
            [FromQuery] bool? activo = null)
        {
            try
            {
                var result = await _serviceGenerico.SearchStringAsync(field, q, modo, activo);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_planes item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_planes>> Update([FromBody] ef_planes item)
        {
            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        //[HttpDelete]
        //public async Task<IActionResult> Delete([FromQuery] long Id)
        //{
        //    await _serviceGenerico.DeleteLong(Id);
        //    return Ok();
        //}
    }
}
