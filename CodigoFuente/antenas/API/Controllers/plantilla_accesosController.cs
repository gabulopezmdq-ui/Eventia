using API.DataSchema;
using API.DataSchema.DTO;
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
    [AllowAnonymous]
    [Route("[controller]")]
    public class plantilla_accesosController : ControllerBase
    {
        private readonly ICRUDService<ef_plantilla_accesos> _serviceGenerico;
        private readonly ILogger<plantilla_accesosController> _logger;

        public plantilla_accesosController(ILogger<plantilla_accesosController> logger, ICRUDService<ef_plantilla_accesos> serviceGenerico)
        {
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetByActivo")]
        public async Task<ActionResult<IEnumerable<ef_plantilla_accesos>>> GetByVigente([FromQuery] string activo = null)
        {
            var result = await _serviceGenerico.GetByVigente(activo);
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_plantilla_accesos>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpGet("GetByPlantilla")]
        public async Task<ActionResult<IEnumerable<ef_plantilla_accesos>>> GetByPlantilla([FromQuery] short idPlantilla, [FromQuery] string activo = null)
        {
            bool? act = null;
            if (!string.IsNullOrWhiteSpace(activo))
                act = (activo.ToLower() == "true" || activo == "1" || activo.ToLower() == "t");

            var result = await _serviceGenerico.GetListByParam(x =>
                x.id_plantilla == idPlantilla &&
                (act == null || x.activo == act.Value)
            );

            result = result.OrderBy(x => x.orden).ToList();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_plantilla_accesos item)
        {
            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_plantilla_accesos>> Update([FromBody] ef_plantilla_accesos item)
        {
            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        //[HttpDelete]
        //public async Task<IActionResult> Delete(long Id)
        //{
        //    await _serviceGenerico.DeleteLong(Id);
        //    return Ok();
        //}
    }
}
