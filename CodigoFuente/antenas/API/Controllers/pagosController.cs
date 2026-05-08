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
    public class pagosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_pagos> _serviceGenerico;
        private readonly ILogger<pagosController> _logger;

        public pagosController(DataContext context, ILogger<pagosController> logger, ICRUDService<ef_pagos> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<List<ef_pagos>>> GetAll()
        {
            var result = _serviceGenerico.GetAll();
            return Ok(result);
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_pagos>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_pagos>> Get([FromQuery] long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<ef_pagos>>> Search(
            [FromQuery] string field,
            [FromQuery] string q = null,
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
        public async Task<ActionResult> Post([FromBody] ef_pagos item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_pagos>> Update([FromBody] ef_pagos item)
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
