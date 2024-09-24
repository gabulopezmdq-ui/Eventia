using System.IO;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using API.DataSchema;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [ApiController]  //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class ImportarMecanizadasController : ControllerBase
    {
        private readonly IImportacionMecanizadaService<MEC_TMPMecanizadas> _importacionMecanizadaService;

        public ImportarMecanizadasController(IImportacionMecanizadaService<MEC_TMPMecanizadas> importacionService)
        {
            _importacionMecanizadaService = importacionService;
        }

        [HttpPost("ImportarExcel")]
        public async Task<IActionResult> ImportarExcel(IFormFile file)
        {
            try
            {
                await _importacionMecanizadaService.ImportarExcel(file);
                return Ok("Importación exitosa.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
