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
    [Authorize(Roles = "SuperAdmin, Admin")]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class TMPMecanizadasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_TMPMecanizadas> _serviceGenerico;

        public TMPMecanizadasController(DataContext context, ILogger<MEC_TMPMecanizadas> logger, ICRUDService<MEC_TMPMecanizadas> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 100)
        {
            var query = _serviceGenerico.GetAll().AsQueryable();

            var totalItems = query.Count();
            var items = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return Ok(items); // Devuelve solo el array
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_TMPMecanizadas>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_TMPMecanizadas>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<MEC_TMPMecanizadas>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        //[HttpPost]
        //public async Task<ActionResult> Post([FromBody] MEC_TMPMecanizadas tiposLiq)
        //{
        //    await _serviceGenerico.Add(tiposLiq);
        //    return Ok(tiposLiq);
        //}

        //[HttpDelete]
        //public async Task<IActionResult> Delete(int Id)
        //{
        //    await _serviceGenerico.Delete(Id);
        //    return Ok();
        //}

        //[HttpPut]
        //public async Task<ActionResult<MEC_TMPMecanizadas>> Update([FromBody] MEC_TMPMecanizadas tiposLiq)
        //{
        //    await _serviceGenerico.Update(tiposLiq);
        //    return Ok(tiposLiq);
        //}


    }
}
