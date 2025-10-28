using  API.DataSchema;
using  API.Services;
using FluentAssertions.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Bogus.Person.CardAddress;

namespace API.Controllers
{
    [ApiController]
    //[Authorize(Roles = "SuperAdmin, Admin")]
    [AllowAnonymous]
    [Route("[controller]")]
    public class EFIMuniController : ControllerBase
    {
        private readonly IEFIMuniService _eFIService;

        public EFIMuniController(IEFIMuniService eFIService)
        {
            _eFIService = eFIService;
        }

        [HttpGet("Legajo")]
        public async Task<ActionResult<IEnumerable<Cargos>>> GetCargosPorLegajo(int nroLegajo)
        {
            var cargos = await _eFIService.ObtenerLegajoConCargoAsync(nroLegajo);

            if (cargos == null || cargos.Count() == 0)
                return NotFound($"No se encontraron cargos para el legajo {nroLegajo}.");

            return Ok(cargos);
        }

        [HttpGet("DocentesEFI")]
        public async Task<IActionResult> GetByUnidadEducativa(string codDepend)
        {
            var result = await _eFIService.GetDocentesByUEAsync(codDepend);
            return Ok(result);
        }


        [HttpGet("DocentesEFIPOF")]
        public async Task<IActionResult> GetByUEPOF(string codDepend)
        {
            var result = await _eFIService.GetEFIPOFAsync(codDepend);
            return Ok(result);
        }

    }
}
