using  API.DataSchema;
using API.DataSchema.DTO;
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
    public class PersonasController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<MEC_Personas> _serviceGenerico;
        private readonly IEFIMuniService _eFIService;

        public PersonasController(DataContext context, ILogger<MEC_CarRevista> logger, ICRUDService<MEC_Personas> serviceGenerico, IEFIMuniService eFIService)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;

            _eFIService = eFIService;
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_CarRevista>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_Personas>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_Personas>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByDNI")]
        public async Task<ActionResult<MEC_Personas>> GetDni(string dni)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.DNI == dni));
        }

        [HttpGet("GetByApellido")]
        public async Task<ActionResult<MEC_Personas>> GetApellido(string ape)
        {
            return Ok(await _serviceGenerico.GetByParam(u => u.Apellido == ape));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_Personas per)
        {
            await _serviceGenerico.Add(per);
            return Ok(per);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_Personas>> Update([FromBody] MEC_Personas per)
        {
            await _serviceGenerico.Update(per);
            return Ok(per);
        }

        [HttpPost("EFIPersona")]
        public async Task<ActionResult> PostEFI([FromBody] EFIPersonaAltaDTO dto)
        {
            await _eFIService.AltaPersonaDesdeEFI(dto);
            return Ok();
        }

    }
}
