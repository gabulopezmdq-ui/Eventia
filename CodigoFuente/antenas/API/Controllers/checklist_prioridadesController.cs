using API.DataSchema.DTO.Eventos.Checklist;
using API.Services.Eventos.Checklist;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class checklist_prioridadesController : ControllerBase
    {
        private readonly IChecklistPrioridadesService _service;

        public checklist_prioridadesController(IChecklistPrioridadesService service)
        {
            _service = service;
        }

        [HttpGet("combo")]
        public async Task<ActionResult<List<ChecklistPrioridadComboDTO>>> Combo([FromQuery] int idIdioma = 1)
        {
            try
            {
                var result = await _service.ComboAsync(idIdioma);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}