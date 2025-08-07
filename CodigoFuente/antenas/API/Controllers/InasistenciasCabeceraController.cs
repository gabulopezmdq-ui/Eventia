using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        private readonly ICRUDService<MEC_InasistenciasDetalle> _serviceGenericoInas;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InasistenciasCabeceraController(DataContext context, ILogger<CabeceraLiquidacionController> logger, ICabeceraInasistenciasService cabeceraService, ICRUDService<MEC_InasistenciasCabecera> serviceGenerico, IHttpContextAccessor httpContextAccessor, ICRUDService<MEC_InasistenciasDetalle> serviceGenericoInas)
        {
            _context = context;
            _cabeceraService = cabeceraService;
            _serviceGenerico = serviceGenerico;
            _httpContextAccessor = httpContextAccessor;
            _serviceGenericoInas = serviceGenericoInas;
        }

        [HttpGet("CheckIfExists")]
        public async Task<ActionResult<bool>> CheckIfExists([FromQuery] string anio, [FromQuery] string mes, [FromQuery] int idTipo, [FromQuery] string ordenPago)
        {
            if (string.IsNullOrEmpty(anio) || string.IsNullOrEmpty(mes))
                return BadRequest("El año y el mes son obligatorios.");

            var exists = await _cabeceraService.CheckIfExists(anio, mes, idTipo, ordenPago);
            return Ok(new { exists });
        }

        [HttpGet("GetFechas")]
        public async Task<IActionResult> GetFechas(int idEstablecimiento)
        {
            var resultado = await _cabeceraService.ObtenerFechas(idEstablecimiento);

            if (resultado == null)
            {
                return NotFound();
            }

            return Ok(resultado);
        }

        [HttpGet("InasistenciasListado")]
        public async Task<IActionResult> GetInasistenciaPorPeriodo(int idEstablecimiento, int anio, int mes)
        {
            var resultado = await _cabeceraService.ObtenerInasistenciaPorPeriodoAsync(idEstablecimiento, anio, mes);

            if (resultado == null)
            {
                return NotFound($"No se encontró inasistencia para Establecimiento {idEstablecimiento}, {anio}-{mes}.");
            }

            return Ok(resultado);
        }

        [HttpPost("AddCabecera")]
        public async Task<ActionResult<string>> AddCabecera([FromBody] AddCabeceraRequestDTO request)
        {
            try
            {
                var result = await _cabeceraService.AddCabeceraAsync(
                    request.IdCabecera,
                    request.IdEstablecimiento,
                    request.Anio,
                    request.Mes
                );

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

        //BOTON DEVOLVER A EST
        [HttpPost("Devolver")]
        public async Task<IActionResult> DevolverEst([FromBody] DevolverEst request)
        {
            var idUsuario = _httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
            int usuario = int.Parse(idUsuario.Value);

            if (string.IsNullOrWhiteSpace(request.MotivoRechazo))
                return BadRequest(new { mensaje = "Debe ingresar el motivo de rechazo." });

            var resultado = await _cabeceraService.DevolverAEstablecimientoAsync(
                request.IdCabecera,
                usuario,
                request.MotivoRechazo);

            if (!resultado.Exito)
                return BadRequest(new { mensaje = resultado.Mensaje });

            return Ok(new { mensaje = "La cabecera fue devuelta al establecimiento correctamente." });
        }

        [HttpPost("Corregido")]
        public async Task<IActionResult> MarcarCorregidoEducacion([FromBody] int? idCabecera)
        {
            var resultado = await _cabeceraService.CorregidoEducacion(idCabecera);

            if (!resultado.Exito)
                return BadRequest(resultado.Mensaje);

            return Ok("Cabecera marcada como Corregida por Educación");
        }

        //Correccion inasistencias
        [HttpGet("EstCorrecciones")]
        public async Task<IActionResult> FiltrarCabecera()
        {
            var claim = _httpContextAccessor.HttpContext?.User?.Claims
                .FirstOrDefault(c => c.Type == "id");

            if (claim == null || !int.TryParse(claim.Value, out int idUsuario))
                return Unauthorized("No se pudo obtener el ID de usuario desde el token.");

            var resultado = await _cabeceraService.ObtenerCabeceraInasistenciasAsync(idUsuario);

            return Ok(resultado);
        }

        [HttpGet("Detalle")]
        public async Task<ActionResult> ObtenerDetalleYRechazos(int idCabecera)
        {
            var resultado = await _cabeceraService.ObtenerDetalleYRechazosPorCabeceraAsync(idCabecera);
            return Ok(resultado);
        }

        //Obtener detalles Mecanizadas/POF

        [HttpGet("GetMecanizadas")]

        public async Task<ActionResult> ObtenerMecanizadas(int idCabecera, int idEstablecimiento)
        {
            var resultado = await _cabeceraService.ObtenerMecanizadas(idCabecera, idEstablecimiento);
            return Ok(resultado);
        }

        [HttpPost("AddMecanizadas")]

        public async Task<ActionResult> AddMecanizadas([FromBody] MEC_InasistenciasDetalle inasistencias)
        {
            var resultado = await _cabeceraService.GuardarInasistenciaAsync(inasistencias);
            if (!resultado.Exito)
                return BadRequest(resultado.Mensaje);

            return Ok("Guardado exitosamente.");
        }

        //ENVIO DE INASISTENCIAS
        [HttpGet("GetCabecerasInas")]
        public async Task<ActionResult> ObtenerCabeceras(int idCabecera)
        {
            var resultado = await _cabeceraService.ObtenerCabecerasInas(idCabecera);
            return Ok(resultado);
        }

        [HttpGet("GetDetalleInas")]
        public async Task<ActionResult> ObtenerDetalles(int idEstablecimiento, int idInasistenciaCabecera)
        {
            var resultado = await _cabeceraService.DetalleInasistencia(idEstablecimiento, idInasistenciaCabecera);
            return Ok(resultado);
        }

        [HttpPost("EnviarInas")]
        public async Task<IActionResult> ConfirmarInas([FromBody] ConfirmarInasistenciaDTO request)
        {
            try
            {
                var resultado = await _cabeceraService.EnviarInas(
                    request.IdInasistenciaCabecera,
                    request.Observaciones
                );

                if (resultado)
                    return Ok("Inasistencia confirmada y enviada correctamente.");
                else
                    return BadRequest("No se pudo confirmar la inasistencia.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("AgregarInasDetalle")]
        public async Task<IActionResult> AgregarInas([FromBody] MEC_InasistenciasDetalle detalle)
        {
            await _serviceGenericoInas.Add(detalle);
            return Ok(detalle);
        }
    }

}