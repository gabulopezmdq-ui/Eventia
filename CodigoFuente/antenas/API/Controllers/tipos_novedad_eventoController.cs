using API.DataSchema.DTO;
using API.Services;
using API.Services.Eventos.Novedades;
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
    public class tipos_novedad_eventoController : ControllerBase
    {
        private readonly ITiposNovedadEventoService _service;

        public tipos_novedad_eventoController(ITiposNovedadEventoService service)
        {
            _service = service;
        }

        [HttpGet("combo")]
        public async Task<ActionResult<List<TipoNovedadEventoComboDTO>>> Combo([FromQuery] int idIdioma = 1)
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