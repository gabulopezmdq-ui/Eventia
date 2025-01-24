using API.DataSchema;
using API.Services;
using API.Services.ImportacionMecanizada;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class ConsolidarController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConsolidarMecanizadaService _consolidarMecanizadaService;
        public ConsolidarController(
            IConsolidarMecanizadaService consolidarMecanizadaService,
            IHttpContextAccessor httpContextAccessor)
        {
            _consolidarMecanizadaService = consolidarMecanizadaService;
            _httpContextAccessor = httpContextAccessor;
        }
        [HttpPost("ObtenerConteosConsolidado")]
        public async Task<IActionResult> ObtenerConteosConsolidado(int estadoCabecera)
        {
            try
            {
                var conteos = await _consolidarMecanizadaService.ObtenerConteosConsolidadoAsync(estadoCabecera);
                return Ok(conteos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("HabilitarAcciones")]
        public async Task<IActionResult> HabilitarAcciones(int idEstablecimiento, string estadoCabecera)
        {
            try
            {
                if (idEstablecimiento <= 0)
                    return BadRequest("El ID del establecimiento no puede ser menor o igual a cero.");

                if (string.IsNullOrWhiteSpace(estadoCabecera))
                    return BadRequest("El estado de la cabecera no puede ser nulo o vacío.");

                var habilitado = await _consolidarMecanizadaService.HabilitarAccionesAsync(idEstablecimiento, estadoCabecera);

                // Devolver la respuesta adecuada en formato JSON
                return Ok(new { Habilitado = habilitado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Ocurrió un error interno en el servidor.", Detalles = ex.Message });
            }
        }


        [HttpGet("HabilitarCambiarEstadoCabecera")]
        public async Task<IActionResult> HabilitarCambiarEstadoCabecera(int idCabecera)
        {
            try
            {
                if (idCabecera <= 0)
                    return BadRequest("El ID de la cabecera no puede ser menor o igual a cero.");

                var habilitado = await _consolidarMecanizadaService.HabilitarCambiarEstadoCabeceraAsync(idCabecera);

                // Devolver la respuesta con el estado de habilitación
                return Ok(new { Habilitado = habilitado });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Ocurrió un error interno en el servidor.", Detalles = ex.Message });
            }
        }
    }
}
