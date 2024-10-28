using API.DataSchema;
using API.Migrations;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class POFController : ControllerBase
    {
        private readonly DataContext _context;
<<<<<<< HEAD
        private readonly ICRUDService<MEC_POF> _serviceGenerico;

        public POFController(DataContext context, ILogger<MEC_POF> logger, ICRUDService<MEC_POF> serviceGenerico)
=======
        private readonly POFService _pofService;
        private readonly ICRUDService<MEC_POF> _serviceGenerico;

        public POFController(DataContext context, ILogger<MEC_POF> logger, ICRUDService<MEC_POF> serviceGenerico, POFService pofService)
>>>>>>> parent of 6a3eaa6 (POF)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
        }
        
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_POF>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_POF>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByIdPersona")]
        public async Task<ActionResult<MEC_POF>> GetPersona(int IdPersona)
        {
        //    var conceptos = await _serviceGenerico.GetByParam(u => u.Descripcion == Name);
        //    var ordenar = conceptos.OrderBy( u => u.Descripcion).ToList();
            return Ok(await _serviceGenerico.GetByParam(u => u.IdPersona == IdPersona));
        }

        [HttpGet("GetByIdEstablecimiento")]
        public async Task<ActionResult<MEC_POF>> GetEstablecimiento(int IdEstablecimiento)
        {
            //    var conceptos = await _serviceGenerico.GetByParam(u => u.Descripcion == Name);
            //    var ordenar = conceptos.OrderBy( u => u.Descripcion).ToList();
            return Ok(await _serviceGenerico.GetByParam(u => u.IdEstablecimiento == IdEstablecimiento));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_POF pof)
        {
            await _serviceGenerico.Add(pof);
            return Ok(pof);
        }

<<<<<<< HEAD
=======
        [HttpPost("VerificarPOF")]
        public async Task<IActionResult> VerificarPOF([FromBody] MEC_POF request)
        {
            // Llama al servicio para verificar y obtener datos de POF
            var (existe, pofData, mensaje) = await _pofService.VerificarPofAsync(
                request.Persona.DNI,
                request.Persona.Legajo,
                request.IdEstablecimiento);

            if (existe)
            {
                return Ok(new { Existe = true, DatosPof = pofData });
            }

            return Ok(new { Existe = false, Mensaje = mensaje });
        }

>>>>>>> parent of 6a3eaa6 (POF)
        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<MEC_POF>> Update([FromBody] MEC_POF pof)
        {
            await _serviceGenerico.Update(pof);
            return Ok(pof);
        }

    }
}
