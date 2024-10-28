using API.DataSchema;
using API.DataSchema.DTO;
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
        private readonly IPOFService _pofService;
        private readonly ICRUDService<MEC_POF> _serviceGenerico;

        public POFController(DataContext context, ILogger<MEC_POF> logger, ICRUDService<MEC_POF> serviceGenerico, IPOFService pofService)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _pofService = pofService;
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

        [HttpPost("VerificarPOF")]
        public async Task<IActionResult> VerificarPOF([FromBody] POFRequestDTO request)
        {  // Llama al servicio para verificar y obtener datos de POF
            var (existe, pofData, mensaje, datosRegistroManual) = await _pofService.VerificarPofAsync(
                request.Persona.DNI,
                request.Persona.Legajo,
                request.IdEstablecimiento);

            if (existe)
            {
                // Si existe una MEC_POF, retornar datos para el paso 2
                return Ok(new
                {
                    Existe = true,
                    Mensaje = mensaje,
                    DatosPof = pofData,
                    IdPersona = pofData.IdPersona,
                    IdEstablecimiento = pofData.IdEstablecimiento
                });
            }

            // Si no existe POF, retornar datos para habilitar los campos
            return Ok(new
            {
                Existe = false,
                Mensaje = mensaje,
                DatosRegistroManual = datosRegistroManual
            });
        }



        [HttpPost("RegistrarPersona")]
        public async Task<IActionResult> RegistrarPersona([FromBody] RegistrarPersonaRequest request)
        {
            var result = await _pofService.RegistrarPersonaAsync(request.DNI, request.Legajo, request.Apellido, request.Nombre);
            if (result)
            {
                // Regresa al paso dos luego de registrar
                return Ok(new { Mensaje = "Persona registrada correctamente." });
            }
            return BadRequest("Error al registrar la persona.");
        }

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
