using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using FluentAssertions.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class POFAntigController : ControllerBase
    {
        private readonly DataContext _context;

        private readonly IPOFService _pofService;
        private readonly ICRUDService<MEC_POF_Antiguedades> _serviceGenerico;

        public POFAntigController(DataContext context, ILogger<MEC_POF> logger, ICRUDService<MEC_POF_Antiguedades> serviceGenerico, IPOFService pofService)
        {
            _pofService = pofService;
            _context = context;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_POF_Antiguedades>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }
        [HttpGet("GetByIdPersona")]
        public async Task<IActionResult> GetByIdPOF([FromQuery] int idPersona)
        {
            var antiguedad = await _pofService.GetByIdPOFAsync(idPersona);
            if (antiguedad == null)
            {
                return Ok(false);
            }
            return Ok(antiguedad);
        }


        [HttpPost]
        public async Task<IActionResult> CreatePOFAntiguedad([FromBody] MEC_POF_Antiguedades antiguedad)
        {
            await _serviceGenerico.Add(antiguedad);
            return Ok(antiguedad);
        }


        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_CarRevista>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }


        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_POF_Antiguedades>> Update([FromBody] MEC_POF_Antiguedades pof)
        {
            await _serviceGenerico.Update(pof);
            return Ok(pof);
        }

    }
}
