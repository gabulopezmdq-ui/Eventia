using API.DataSchema;
using API.DataSchema.DTO;
using API.Migrations;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        [HttpPost("VerificarPOF")]
        public async Task<IActionResult> VerificarPOF([FromBody] VerifDNIDTO request)
        {
            if (request == null)
            {
                return BadRequest("El cuerpo de la solicitud no puede ser nulo.");
            }

            // Validar que el DNI no sea nulo o vacío
            if (string.IsNullOrWhiteSpace(request.DNI))
            {
                return BadRequest("El número de documento no puede estar vacío.");
            }

            // Verificar persona usando solo el DNI
            var (existe, persona, mensaje, datosRegistroManual) = await _pofService.VerificarYRegistrarPersonaAsync(request.DNI);

            if (existe)
            {
                // Si existe, retornar datos para el paso 2
                return Ok(new
                {
                    Existe = true,
                    Mensaje = mensaje,
                    DatosPersona = persona,
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

        [HttpPost("CompletarRegistroPersona")]
        public async Task<IActionResult> CompletarRegistroPersona([FromBody] RegistrarPersonaRequestDTO request)
        {
            var mensaje = await _pofService.CompletarRegistroPersonaAsync(request.DNI, request.Legajo, request.Apellido, request.Nombre);

            if (mensaje == "Persona registrada correctamente.")
            {
                return Ok(new { Mensaje = mensaje });
            }
            return BadRequest(mensaje);
        }

        [HttpPost("RegistrarPOF")]
        public async Task<IActionResult> RegistrarPOF([FromBody] MEC_POF POF)
        {
            if (POF == null)
            {
                return BadRequest("El cuerpo de la solicitud no puede ser nulo.");
            }

            //// Verificar si la persona existe en MEC_Personas usando el DNI
            //var personaExistente = await _context.MEC_Personas.FirstOrDefaultAsync(p => p.IdPersona == POF.IdPersona);
            //if (personaExistente == null)
            //{
            //    return Conflict("No se encontró una persona con el ID proporcionado.");
            //}

            // Verificar si ya existe un registro en MEC_POF para esta persona y establecimiento
            if (await ExisteRegistroEnPOFAsync(POF.IdPersona, POF.IdEstablecimiento))
            {
                return Conflict("Ya existe un registro en MEC_POF para esta persona y establecimiento.");
            }

            // Si no existe, proceder a crear el nuevo registro
            _context.MEC_POF.Add(POF);
            await _context.SaveChangesAsync();  
            return Ok("POF registrada correctamente.");
        }

        private async Task<bool> ExisteRegistroEnPOFAsync(int idPersona, int idEstablecimiento)
        {
            // Implementa tu lógica para verificar si ya existe el registro
            return await _context.MEC_POF.AnyAsync(p => p.IdPersona == idPersona && p.IdEstablecimiento == idEstablecimiento);
        }

        [HttpPost("RegistrarSuplencia")]
        public async Task<IActionResult> RegistrarSuplencia([FromBody] MEC_POF POF)
        {
            if (POF == null)
            {
                return BadRequest("El cuerpo de la solicitud no puede ser nulo.");
            }

            // Verificar si ya existe un registro en MEC_POF para esta persona y establecimiento
            var mensajeValidacion = await _pofService.RegistrarSuplenciaAsync(POF.IdPersona, POF.IdEstablecimiento, POF.Secuencia, POF.Barra, POF.IdCategoria, 
                POF.TipoCargo, POF.Vigente);

            if (mensajeValidacion.StartsWith("Ya existe"))
            {
                return Conflict(mensajeValidacion);
            }

            // Si no existe, proceder a crear el nuevo registro
            _context.MEC_POF.Add(POF);
            await _context.SaveChangesAsync();

            return Ok("POF registrada correctamente.");
        }
    }
}
