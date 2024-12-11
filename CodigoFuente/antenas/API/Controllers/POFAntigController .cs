using API.DataSchema;
using API.DataSchema.DTO;
using API.Migrations;
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
        [HttpGet("GetByIdPOF")]
        public async Task<IActionResult> GetByIdPOF([FromQuery] int idPOF)
        {
            var pofAntiguedad = await _context.MEC_POF_Antiguedades
                .FirstOrDefaultAsync(a => a.IdPOF == idPOF);

            // Verificar si no existe ningún registro
            if (pofAntiguedad == null)
            {
                // Si no existe, devolver un 204 No Content con un mensaje en formato JSON
                return NoContent(); // 204: No Content, para que el frontend cargue el formulario vacío
            }

            // Verificar si hay más de un registro para el mismo IdPOF
            var count = await _context.MEC_POF_Antiguedades
                .CountAsync(a => a.IdPOF == idPOF);

            if (count > 1)
            {
                // Si hay más de un registro, devolver un 400 Bad Request con un mensaje en formato JSON
                return BadRequest(new { Message = "Existen múltiples registros para el mismo IdPOF." });
            }

            // Si todo está bien y existe solo un registro, devolver el objeto con 200 OK
            return Ok(pofAntiguedad); // 200: OK, para devolver los datos del registro existente
        }


        [HttpPost]
        public async Task<IActionResult> CreatePOFAntiguedad([FromBody] MEC_POF_Antiguedades antiguedad)
        {
            // Validar unicidad del IdPOF
            var existingRecord = await _pofService.GetByIdPOFAsync(antiguedad.IdPOF);
            if (existingRecord != null)
            {
                return BadRequest($"Ya existe un registro con IdPOF: {antiguedad.IdPOF}");
            }

            await _pofService.CreateOrUpdateAsync(antiguedad);
            return CreatedAtAction(nameof(GetByIdPOF), new { idPOF = antiguedad.IdPOF }, antiguedad);
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
            await _serviceGenerico.UpdatePOF(pof);
            return Ok(pof);
        }

    }
}
