using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
using DocumentFormat.OpenXml.Office2010.Excel;
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
        private readonly IAprobarInasistenciasService _aprobarService;
        private readonly ICRUDService<MEC_InasistenciasCabecera> _serviceGenerico;
        private readonly ICRUDService<MEC_CabeceraLiquidacion> _serviceCabLiq;
        private readonly ICRUDService<MEC_InasistenciasDetalle> _serviceGenericoInas;
        private readonly ICRUDService<MEC_TMPErroresInasistenciasDetalle> _serviceGenericoErrores;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InasistenciasCabeceraController(DataContext context, ILogger<CabeceraLiquidacionController> logger, ICabeceraInasistenciasService cabeceraService, ICRUDService<MEC_InasistenciasCabecera> serviceGenerico, IHttpContextAccessor httpContextAccessor, ICRUDService<MEC_InasistenciasDetalle> serviceGenericoInas, ICRUDService<MEC_TMPErroresInasistenciasDetalle> serviceGenericoErrores, ICRUDService<MEC_CabeceraLiquidacion> serviceCabLiq)
        {
            _context = context;
            _cabeceraService = cabeceraService;
            _serviceGenerico = serviceGenerico;
            _httpContextAccessor = httpContextAccessor;
            _serviceGenericoInas = serviceGenericoInas;
            _serviceGenericoErrores = serviceGenericoErrores;
            _serviceCabLiq = serviceCabLiq;
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
        public async Task<IActionResult> GetFechas(int idEstablecimiento, int idCabecera)
        {
            var resultado = await _cabeceraService.ObtenerFechas(idEstablecimiento, idCabecera);

            if (resultado == null)
            {
                return NotFound();
            }

            return Ok(resultado);
        }

        [HttpGet("InasistenciasListado")]
        public async Task<IActionResult> GetInasistenciaPorPeriodo(int idEstablecimiento, int anio, int mes, int idCabecera)
        {
            // Llama al servicio que crea o devuelve la cabecera
            var cabecera = await _cabeceraService.AddCabeceraAsync(idCabecera, idEstablecimiento, anio, mes);

            if (cabecera == null)
            {
                return BadRequest("No se pudo crear o recuperar la cabecera de inasistencia.");
            }

            return Ok(cabecera);
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
            return Ok(_serviceCabLiq.GetAll());
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

        //Una vez que se selecciona el combo POF, se deberá completar el combo MEC_POF_Barra con el IdPOF seleccionado y armar una lista con todas las barras de la tabla  MEC_POF_Barras.
       
        [HttpPost("AgregarDetalle")]
        public async Task<IActionResult> AgregarInasistencia([FromBody] InasistenciaRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _cabeceraService.AgregarInasistenciaAsync(
                    request.IdCabeceraInasistencia,
                    request.IdPOF,
                    request.IdPOFBarra,
                    request.IdTMPInasistenciasDetalle,
                    request.CodLicencia,
                    request.Fecha,
                    request.CantHs
                );

                return Ok(new { message = "Inasistencia agregada correctamente." });
            }
            catch (Exception ex)
            {
                // Puedes registrar el error con logger aquí
                return StatusCode(500, new { message = "Ocurrió un error al agregar la inasistencia.", error = ex.Message });
            }
        }
        [HttpGet("Inasistencias")]
        public async Task<ActionResult<IEnumerable<MEC_TMPInasistenciasDetalle>>> GetInasistenciasDetalle()
        {
            var resultado = await _cabeceraService.ObtenerInas();
            return Ok(resultado);
        }

        [HttpPost("Procesar")]
        public async Task<IActionResult> ProcesarTMPInasistencias([FromBody] ProcesarInasistencias request)
        {
            if (request == null)
                return BadRequest("El body de la petición está vacío.");

            await _cabeceraService.ProcesarTMPInasistencias(
                request.IdCabeceraLiquidacion,
                request.IdCabeceraInasistencia,
                request.IdEstablecimiento,
                request.UE
            );

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

        [HttpPost("AprobarInas")]
        public async Task<IActionResult> AprobarInas([FromBody] int idInasDetalle)
        {
            try
            {
                var resultado = await _aprobarService.AceptarInas(idInasDetalle);

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

        [HttpPost("RechazarInas")]
        public async Task<IActionResult> RechazarInas([FromBody] int idInasDetalle, string observaciones)
        {
            try
            {
                var resultado = await _aprobarService.RechazarInas(idInasDetalle, observaciones);

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

        [HttpPost("AgregarInas")]
        public async Task<IActionResult> AgregarInasDetalle([FromBody] MEC_InasistenciasDetalle detalle)
        {
            var exito = await _aprobarService.AgregarDetalle(detalle);

            if (exito)
                return Ok(new { mensaje = "Inasisetncia creada correctamente" });
            else
                return BadRequest(new { mensaje = "Error al crear la inasistencia" });
        }

        [HttpGet("ObtenerInas")]
        public async Task<IActionResult> ObtenerInasEduc(int idInasistenciaCabecera)
        {
            var exito = await _aprobarService.ObtenerInasEduc(idInasistenciaCabecera);

            return Ok(exito);
        }

        [HttpPost("EnviarInas")]
        public async Task<IActionResult> EnviarInas([FromBody] List<int> idInasistencias)
        {
            var resultado = await _aprobarService.EnviarInas(idInasistencias);
            if (!resultado)
                return NotFound("No se encontraron registros para actualizar.");

            return Ok("Inasistencias actualizadas correctamente.");
        }

        [HttpPost("EnviarCabecera")]
        public async Task<IActionResult> EnviarEduc([FromBody] int idCabecera, string? observaciones)
        {
            var cabecera = await _aprobarService.EnviarEduc(idCabecera, observaciones);
            if (!cabecera)
                return NotFound("No se encontró la cabecera.");

            return Ok("Cabecera enviada correctamente.");   
        }

        //GET INASISTENCIAS ERORES

        [HttpGet("ErroresInas")]
        public async Task<IActionResult> ObtenerErrores ()
        {
            return Ok(_serviceGenericoErrores.GetAll());
        }
    }

}