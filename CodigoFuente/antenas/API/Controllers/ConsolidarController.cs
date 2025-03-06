using API.DataSchema;
using API.Services;
using API.Services.ImportacionMecanizada;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

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

        [HttpGet("ObtenerConteosConsolidado")]
        public async Task<IActionResult> ObtenerConteosConsolidado(int idCabecera)
        {
            try
            {
                if (idCabecera <= 0)
                    return BadRequest("El ID de la cabecera no puede ser menor o igual a cero.");

                var conteos = await _consolidarMecanizadaService.ObtenerConteosConsolidadoAsync(idCabecera);

                if (conteos == null)
                    return NotFound("No se encontraron registros para la cabecera especificada.");

                return Ok(conteos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Error = "Ocurrió un error interno en el servidor.",
                    Detalles = ex.Message
                });
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

        [HttpGet("ObtenerRegistrosPOFNoMecanizados")]
        public async Task<IActionResult> ObtenerRegistrosPOFNoMecanizados(int idCabecera, int idEstablecimiento)
        {
            var registros = await _consolidarMecanizadaService.ObtenerRegistrosPOFNoMecanizadosAsync(idCabecera, idEstablecimiento);

            return Ok(registros);
        }

        [HttpGet("ValidarExistenciaAntiguedad")]
        public async Task<IActionResult> ValidarExistenciaAntiguedad(int idPOF)
        {
            try
            {
                if (idPOF <= 0)
                    return BadRequest("El ID del POF no puede ser menor o igual a cero.");

                bool existe = await _consolidarMecanizadaService.ValidarExistenciaAntiguedadAsync(idPOF);

                return Ok(new { Existe = existe });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Ocurrió un error interno en el servidor.", Detalles = ex.Message });
            }
        }
        [HttpPost("ProcesarAltaMecanizada")]
        public async Task<IActionResult> ProcesarAltaMecanizada([FromBody] AltaMecanizadaDTO datos)
        {
            try
            {
                if (datos == null)
                    return BadRequest("Los datos no pueden ser nulos.");

                bool resultado = await _consolidarMecanizadaService.ProcesarAltaMecanizadaAsync(datos);

                if (resultado)
                    return Ok(new { Mensaje = "Alta mecanizada procesada correctamente." });

                return BadRequest("No se pudo procesar el alta mecanizada.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Ocurrió un error interno en el servidor.", Detalles = ex.Message });
            }
        }

        [HttpDelete("EliminarMEC")]

        public async Task<IActionResult> EliminarMecanizada(int idMecanizada)
        {
            var resultado = await _consolidarMecanizadaService.EliminarRegistroMECMecanizadaAsync(idMecanizada);

            if (resultado)
            {
                return Ok(new { message = "Registro eliminado" });
            }
            else
            {
                return NotFound(new { message = "Error al intentar eliminar el registro" });
            }
        }

        [HttpPost("Antiguedad")]
        public async Task<IActionResult> GenerarRegistro([FromBody] AltaMecanizadaDTO datos)
        {
            await _consolidarMecanizadaService.CrearRegistroAntigDet(datos);
            return Ok("Registro creado");
        }

        [HttpGet ("Suplentes")]
        
        public async Task<IActionResult> ObtenerSuplentes(int idCabecera, int idEstablecimiento)
        {
            var suplentes = await _consolidarMecanizadaService.ObtenerSuplentesAsync(idCabecera, idEstablecimiento);
            return Ok(suplentes);

        }


    }
}