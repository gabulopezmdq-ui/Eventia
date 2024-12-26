using API.DataSchema;
using API.Services;
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
    public class CabeceraLiquidacionController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICabeceraLiquidacionService _cabeceraService;

        public CabeceraLiquidacionController(DataContext context, ILogger<CabeceraLiquidacionController> logger, ICabeceraLiquidacionService cabeceraService)
        {
            _context = context;
            _cabeceraService = cabeceraService;
        }

        [HttpGet("CheckIfExists")]
        public async Task<ActionResult<bool>> CheckIfExists([FromQuery] string anio, [FromQuery] string mes, [FromQuery] int idTipo)
        {
            if (string.IsNullOrEmpty(anio) || string.IsNullOrEmpty(mes))
                return BadRequest("El año y el mes son obligatorios.");

            var exists = await _cabeceraService.CheckIfExists(anio, mes, idTipo);
            return Ok(new { exists });
        }

        [HttpPost]
        public async Task<ActionResult<string>> AddCabecera([FromBody] MEC_CabeceraLiquidacion cabecera)
        {
            if (cabecera == null)
                return BadRequest("La cabecera no puede ser nula.");

            try
            {
                var result = await _cabeceraService.AddCabeceraAsync(cabecera);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error inesperado: {ex.Message}");
            }
        }


    }
}