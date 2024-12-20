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
        private readonly ICabeceraLiquidacionService _cabeceraLiquidacionService;
        private readonly ILogger<CabeceraLiquidacionController> _logger;

        public CabeceraLiquidacionController(ICabeceraLiquidacionService cabeceraLiquidacionService, ILogger<CabeceraLiquidacionController> logger)
        {
            _cabeceraLiquidacionService = cabeceraLiquidacionService;
            _logger = logger;
        }

        // Obtener todas las cabeceras de liquidación
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_CabeceraLiquidacion>>> Get()
        {
            try
            {
                var cabeceras = await _cabeceraLiquidacionService.GetAllAsync();
                return Ok(cabeceras);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener las cabeceras de liquidación: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // Obtener una cabecera de liquidación por su ID
        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_CabeceraLiquidacion>> Get(int Id)
        {
            try
            {
                var cabecera = await _cabeceraLiquidacionService.GetByIdAsync(Id);
                if (cabecera == null)
                {
                    return NotFound($"Cabecera de liquidación con ID {Id} no encontrada.");
                }
                return Ok(cabecera);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener la cabecera de liquidación con ID {Id}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // Crear una nueva cabecera de liquidación
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MEC_CabeceraLiquidacion cabecera)
        {
            if (cabecera.CalculaInasistencias == "S" || cabecera.CalculaBajas == "S")
            {
                // Si CalculaInasistencias o CalculaBajas es "S", mostrar un mensaje de advertencia
                return BadRequest("La Cabecera de Liquidación se configuró para que genere reportes para la carga de Bajas e Inasistencias. Si es correcto presione Continuar, de lo contrario Cancele el proceso y realice las modificaciones necesarias.");
            }

            // Verificar si ya existe un registro con el mismo Año, Mes y Tipo de Liquidación
            var exists = await _cabeceraLiquidacionService.CheckIfExists(cabecera.AnioLiquidacion, cabecera.MesLiquidacion, cabecera.idTipoLiquidacion);
            if (exists)
            {
                return BadRequest("Ya existe una Cabecera de Liquidación para el Mes/Año y Tipo de Liquidación.");
            }

            try
            {
                // Asignar el ID de usuario desde los claims
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
                if (userIdClaim != null)
                {
                    cabecera.IdUsuario = int.Parse(userIdClaim.Value);
                }

                // Crear la cabecera de liquidación
                var createdCabecera = await _cabeceraLiquidacionService.CreateAsync(cabecera);
                return CreatedAtAction(nameof(Get), new { Id = createdCabecera.IdCabecera }, createdCabecera);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear la cabecera de liquidación: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // Eliminar una cabecera de liquidación por ID
        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            try
            {
                await _cabeceraLiquidacionService.DeleteAsync(Id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al eliminar la cabecera de liquidación con ID {Id}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // Actualizar una cabecera de liquidación existente
        [HttpPut]
        public async Task<ActionResult<MEC_CabeceraLiquidacion>> Update([FromBody] MEC_CabeceraLiquidacion cabecera)
        {
            try
            {
                // Asignar el ID de usuario desde los claims
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
                if (userIdClaim != null)
                {
                    cabecera.IdUsuario = int.Parse(userIdClaim.Value);
                }

                // Actualizar la cabecera de liquidación
                var updatedCabecera = await _cabeceraLiquidacionService.UpdateAsync(cabecera);
                return Ok(updatedCabecera);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar la cabecera de liquidación con ID {cabecera.IdCabecera}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
