using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using API.Services.ImportacionMecanizada;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

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
        private readonly ICRUDService<MEC_POFDetalle> _servicePOFDetalle;

        public ConsolidarController(
            IConsolidarMecanizadaService consolidarMecanizadaService,
            IHttpContextAccessor httpContextAccessor,
            ICRUDService<MEC_POFDetalle> servicePOFDetalle)
        {
            _consolidarMecanizadaService = consolidarMecanizadaService;
            _httpContextAccessor = httpContextAccessor;
            _servicePOFDetalle = servicePOFDetalle;
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


        [HttpGet ("Mecanizadas")]

        public async Task<IActionResult> ObtenerMecanizadas(int idCabecera, int idEstablecimiento)
        {
            var mecanizadas = await _consolidarMecanizadaService.ObtenerMecanizadas(idCabecera, idEstablecimiento);
            return Ok(mecanizadas.ToList());
        }

        [HttpGet("Docentes")]

        public async Task<IActionResult> ObtenerDocentes(int idEstablecimiento)
        {
            var docentes = await _consolidarMecanizadaService.ObtenerPOFsSimplificadoAsync(idEstablecimiento);
            return Ok(docentes);
        }

        [HttpPost("CrearMEC")]

        public async Task<IActionResult> CrearMec (AltaMecanizadaDTO datos)
        {
            await _consolidarMecanizadaService.ProcesarAltaMecanizadaAsync(datos);
            return Ok();
        }

        [HttpPut("POFDetalle")]
        public async Task<ActionResult> Update([FromBody] POFDetalleRequestDTO request)
        {
            try
            {
                // Llamar al servicio para actualizar el detalle
                await _consolidarMecanizadaService.ActualizarMEC_POFDetalle(
                    request.IdPOF, request.SupleA, request.IdCabecera, request.SupleDesde, request.SupleHasta
                );

                return Ok(new { message = "Detalle actualizado correctamente." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al actualizar el detalle.", error = ex.Message });
            }
        }


        [HttpPost("Consolidar")]
        public async Task<IActionResult> Consolidar(int idCabecera, int idEstablecimiento)
        {
            if (idCabecera <= 0 || idEstablecimiento <= 0)
            {
                return BadRequest("El ID de la cabecera y el establecimiento deben ser mayores a cero.");
            }

            try
            {
                // Obtener el usuario logueado desde el contexto de la petición (ejemplo con claims de JWT)
                var idUsuario = _httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
                int usuario = int.Parse(idUsuario.Value);

                await _consolidarMecanizadaService.ConsolidarRegistrosAsync(idCabecera, idEstablecimiento, usuario);
                return Ok("Registros consolidados exitosamente.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al consolidar registros: {ex.Message}");
            }
        }

        [HttpPost("CambiarEstado")]
        public async Task<IActionResult> CambiarEstado(int idCabecera)
        {
            if (idCabecera <= 0)
            {
                return BadRequest("El ID de la cabecera y el establecimiento deben ser mayores a cero.");
            }

            try
            {
                // Obtener el usuario logueado desde el contexto de la petición (ejemplo con claims de JWT)
                var idUsuario = _httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
                int usuario = int.Parse(idUsuario.Value);

                await _consolidarMecanizadaService.CambiarEstadoCabeceraAsync(idCabecera, usuario);
                return Ok("Registros consolidados exitosamente.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al consolidar registros: {ex.Message}");
            }
        }

        [HttpGet("Reporte")]

        public async Task<IActionResult> ObtenerReporte(int idCabecera, int idEstablecimiento)
        {
            var mecanizadas = await _consolidarMecanizadaService.ObtenerReporte(idCabecera, idEstablecimiento);
            return Ok(mecanizadas.ToList());
        }
    }
}