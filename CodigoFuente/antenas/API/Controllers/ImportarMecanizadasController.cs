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

namespace API.Controllers
{
    [ApiController]  //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class ImportarMecanizadasController : ControllerBase
    {
        private readonly IImportacionMecanizadaService<MEC_TMPMecanizadas> _importacionMecanizadaService;

        private readonly ICRUDService<MEC_Personas> _serviceGenerico;

        public ImportarMecanizadasController(IImportacionMecanizadaService<MEC_TMPMecanizadas> importacionService, ICRUDService<MEC_Personas> serviceGenerico)
        {
            _importacionMecanizadaService = importacionService;
            _serviceGenerico = serviceGenerico;
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
        public async Task<IActionResult> RevetirImportacionAsync([FromBody] int idCabecera)
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
        public async Task<ActionResult<IEnumerable<MEC_TMPMecanizadas>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }
    }
}
