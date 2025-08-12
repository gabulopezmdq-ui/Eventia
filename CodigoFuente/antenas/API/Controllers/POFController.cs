using API.DataSchema;
using API.DataSchema.DTO;
using API.Migrations;
using API.Services;
using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SuperAdmin, Admin, Secretario")]
    //[AllowAnonymous]
    [Route("[controller]")]
    public class POFController : ControllerBase
    {
        private readonly DataContext _context;

        private readonly IPOFService _pofService;
        private readonly ICRUDService<MEC_POF> _serviceGenerico;
        private readonly ICRUDService<MEC_Personas> _personasGenerico;
        private readonly ICRUDService<MEC_POFDetalle> _pofDetalleGenerico;
        private readonly ICRUDService<MEC_POF_Barras> _pofBarrasGenerico;

        public POFController(DataContext context, ILogger<MEC_POF> logger, ICRUDService<MEC_POF> serviceGenerico, IPOFService pofService, ICRUDService<MEC_Personas> personasGenerico, ICRUDService<MEC_POFDetalle> pofDetalleGenerico, ICRUDService<MEC_POF_Barras> pofBarrasGenerico)
        {
            _context = context;
            _serviceGenerico = serviceGenerico;
            _pofService = pofService;
            _personasGenerico = personasGenerico;
            _pofDetalleGenerico = pofDetalleGenerico;
            _pofBarrasGenerico = pofBarrasGenerico;
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_POF>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll().ToList());
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_CarRevista>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
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
            await _serviceGenerico.UpdatePOF(pof);
            return Ok(pof);
        }

        [HttpPost("VerificarPOF")]
        public async Task<IActionResult> VerificarPOF([FromBody] VerifDNIDTO request)
        {
            var existe = await _pofService.VerificarYRegistrarPersonaAsync(request.DNI);

            return Ok(existe);
        }

        [HttpPost("CompletarRegistroPersona")] //
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
            var existe = await _pofService.ExisteRegistroEnPOFAsync(POF.IdPersona, POF.IdEstablecimiento, POF.Secuencia);

            if (!existe)
            {
                await _serviceGenerico.Add(POF);
                return Ok(POF);
            }

            return BadRequest(existe);
        }

        [HttpPost("POFPersona")]
        public async Task<IActionResult> CreatePersona([FromBody] MEC_Personas persona)
        {
            int idPersona = await _pofService.AddPersona(persona);
            return Ok(new { IdPersona = idPersona });
        }

        [HttpPost("RegistrarSuplencia")] //
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


        //CREA LA BARRA
        [HttpPut("Barras")]
        public async Task<IActionResult> CreateBarras([FromBody] POFBarraDTO dto)
        {
            if (dto == null || dto.Barra == null || dto.Barra.Count == 0)
            {
                return BadRequest("Datos inválidos");
            }

            var resultado = await _pofService.AddBarraAsync(dto);

            if (resultado.BarrasAgregadas.Count == 0 && resultado.BarrasDuplicadas.Count > 0)
            {
                return Conflict(new
                {
                    mensaje = "No se agregaron barras. Todas ya existen.",
                    duplicadas = resultado.BarrasDuplicadas
                });
            }

            return Ok(new
            {
                mensaje = "Proceso finalizado.",
                agregadas = resultado.BarrasAgregadas,
                duplicadas = resultado.BarrasDuplicadas
            });
        }

        [HttpPut("EditarBarra")]
        public async Task<ActionResult<MEC_POF>> Update([FromBody] MEC_POF_Barras barra)
        {
            await _pofBarrasGenerico.Update(barra);
            return Ok(barra);
        }

        [HttpGet("GetPOFBarras")]
        public async Task<ActionResult<IEnumerable<MEC_POF_Barras>>> GetBarras(int idPOF)
        { 
            return Ok(await _pofService.GetBarrasPOF(idPOF));
        }

        [HttpDelete("DeleteBarra")]
        public async Task<IActionResult> DeleteBarra([FromBody] EliminarBarraDTO dto)
        {
            var resultado = await _pofService.EliminarBarraAsync(dto);
            if (!resultado)
                return NotFound("La barra no existe o no coincide con IdPOF.");

            return Ok();
        }
    }
}
