using API.DataSchema.DTO.Transporte;
using API.Services.Transporte;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers.Transporte
{
    [ApiController]
    [Route("eventos/{id_evento}/transporte")]
    [Authorize]
    public class transporteEventoController : ControllerBase
    {
        private readonly ITransporteEventoService _service;

        public transporteEventoController(ITransporteEventoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> Get(long id_evento)
        {
            try
            {
                var dto = await _service.GetByEventoAsync(id_evento);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut]
        public async Task<ActionResult> Upsert(long id_evento, [FromBody] TransporteEventoUpsertRequest req)
        {
            try
            {
                var dto = await _service.UpsertAsync(id_evento, req);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}