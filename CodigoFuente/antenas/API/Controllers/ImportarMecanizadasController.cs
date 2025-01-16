using System.IO;
using Microsoft.AspNetCore.Http;
using ClosedXML.Excel;
using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using FluentAssertions.Common;
using System.Linq;

namespace API.Controllers
{
    [ApiController]  
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]

    public class ImportarMecanizadasController : ControllerBase
    {
        private readonly IImportacionMecanizadaService<MEC_TMPMecanizadas> _importacionMecanizadaService;
        private readonly IProcesarMecanizadaService<MEC_TMPMecanizadas> _procesarMecanizadaService;
        private readonly ICRUDService<MEC_TMPMecanizadas> _serviceGenerico;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ImportarMecanizadasController(IImportacionMecanizadaService<MEC_TMPMecanizadas> importacionService, ICRUDService<MEC_TMPMecanizadas> serviceGenerico, IProcesarMecanizadaService<MEC_TMPMecanizadas> procesarMecanizadaService, IHttpContextAccessor httpContextAccessor)
        {
            _importacionMecanizadaService = importacionService;
            _serviceGenerico = serviceGenerico;
            _procesarMecanizadaService = procesarMecanizadaService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost("ImportarExcel")]
        public async Task<IActionResult> ImportarExcel([FromForm] IFormFile file, [FromForm] int idCabecera)
        {
            try
            {
                await _importacionMecanizadaService.ImportarExcel(file, idCabecera);
                return Ok("Importación exitosa.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("RevertirExcel")]
        public async Task<ActionResult> RevetirImportacionAsync(int idCabecera)
        {
            try
            {
                await _importacionMecanizadaService.RevertirImportacionAsync(idCabecera);
                return Ok("Importación eliminada");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<MEC_TMPMecanizadas>>> Get()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpPost("PreprocesarArchivo")]
        public async Task<IActionResult> PreprocesarArchivo(int idCabecera)
         {
            try
            {
                await _procesarMecanizadaService.PreprocesarAsync(idCabecera);
                return Ok("Preprocesamiento y validación completados exitosamente.");
            }
            catch (Exception ex)
            {
                // Verificar si el error se debe a problemas en las validaciones
                if (ex.Message.Contains("El archivo contiene errores"))
                {
                    return BadRequest(new
                    {
                        mensaje = ex.Message,
                        accionRequerida = "Si el archivo contiene errores de formato, corrija y vuelva a importar. Si faltan registros en tablas paramétricas, agregue los registros necesarios y reprocese el archivo.",
                        estadoCabecera = "Pendiente de Importación"
                    });
                }
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Procesar")]
        public async Task<IActionResult> ProcesarRegistros(int idCabecera)
        {
            try
            {
                var idUsuario = _httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
                int usuario = int.Parse(idUsuario.Value);

                string resultado = await _procesarMecanizadaService.ProcesarSiEsValidoAsync(idCabecera, usuario);

                if (resultado.StartsWith("No"))
                {
                    return BadRequest(resultado);
                }

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al procesar registros: {ex.Message}");
            }
        }
    }
}
