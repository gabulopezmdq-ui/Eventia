using API.DataSchema.DTO.Regalos;
using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers.Regalos
{
    [ApiController]
    [Route("eventos/{id_evento}/regalos/transferencias/config")]
    [Authorize]
    public class regalosTransferenciasConfigController : ControllerBase
    {
        private readonly IRegalosTransferenciasConfigService _service;

        public regalosTransferenciasConfigController(IRegalosTransferenciasConfigService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> Get(long id_evento)
        {
            var dto = await _service.GetAsync(id_evento);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult> Upsert(long id_evento, [FromBody] RegalosTransferenciasConfigUpsertDTO dto)
        {
            try
            {
                var res = await _service.UpsertAsync(id_evento, dto);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}