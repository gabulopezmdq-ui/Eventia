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
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class InasistenciasCabeceraController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICabeceraInasistenciasService _cabeceraService;
        private readonly ICRUDService<MEC_InasistenciasCabecera> _serviceGenerico;

        public InasistenciasCabeceraController(DataContext context, ILogger<CabeceraLiquidacionController> logger, ICabeceraInasistenciasService cabeceraService, ICRUDService<MEC_InasistenciasCabecera> serviceGenerico)
        {
            _context = context;
            _cabeceraService = cabeceraService;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("CheckIfExists")]
        public async Task<ActionResult<bool>> CheckIfExists([FromQuery] string anio, [FromQuery] string mes, [FromQuery] int idTipo, [FromQuery] string ordenPago)
        {
            if (string.IsNullOrEmpty(anio) || string.IsNullOrEmpty(mes))
                return BadRequest("El año y el mes son obligatorios.");

            var exists = await _cabeceraService.CheckIfExists(anio, mes, idTipo, ordenPago);
            return Ok(new { exists });
        }

        [HttpPost]
        public async Task<ActionResult<string>> AddCabecera([FromBody] int idCabecera)
        {
            if (idCabecera == null)
                return BadRequest("La cabecera no puede ser nula.");

            try
            {
                    var result = await _cabeceraService.AddCabeceraAsync(idCabecera);
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

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_CabeceraLiquidacion>>> Get() //Trae los registros Vigentes = S
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetByVigente")]
        public async Task<ActionResult<IEnumerable<MEC_CabeceraLiquidacion>>> GetByVigente([FromQuery] string vigente = null)
        {
            var result = await _serviceGenerico.GetByVigente(vigente);
            return Ok(result);
        }

        [HttpGet("GetAllN")]
        public async Task<ActionResult<IEnumerable<MEC_CabeceraLiquidacion>>> GetAllVigente() //Trae TODOS los registros independientemente de que son Vigente S o N
        {
            return Ok(_serviceGenerico.GetAllVigente());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<MEC_CabeceraLiquidacion>> Get(int Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost("procesar")]
        public async Task<IActionResult> ProcesarTMPInasistencias(
            [FromQuery] int idCabeceraLiquidacion,
            [FromQuery] int idCabeceraInasistencia,
            [FromQuery] int idEstablecimiento,
            [FromQuery] string UE)
        {
            await _cabeceraService.ProcesarTMPInasistencias(idCabeceraLiquidacion, idCabeceraInasistencia, idEstablecimiento, UE);
            return Ok("Procesamiento completado");
        }
        //[HttpPut]
        //public async Task<ActionResult<MEC_CabeceraLiquidacion>> Update([FromBody] MEC_CabeceraLiquidacion cabecera)
        //{
        //    //await _cabeceraService.UpdateCabeceraAsync(cabecera);
        //    ////await _serviceGenerico.Update(cabecera);
        //    //return Ok(cabecera);
        //}
    }
}