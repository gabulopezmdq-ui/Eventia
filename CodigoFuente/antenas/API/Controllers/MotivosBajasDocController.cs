using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class MotivosBajasDocController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_MotivosBajasDoc> _serviceGenerico;

        public MotivosBajasDocController(DataContext context,ICRUDService<MEC_MotivosBajasDoc> serviceGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }

        

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_MotivosBajasDoc>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_MotivosBajasDoc>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_MotivosBajasDoc motivobaja)
        {
            await _serviceGenerico.Add(motivobaja);
            return Ok(motivobaja);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_MotivosBajasDoc>> Update([FromBody] MEC_MotivosBajasDoc motivobaja)
        {
            await _serviceGenerico.Update(motivobaja);
            return Ok(motivobaja);
        }
    }
}
