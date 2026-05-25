using API.DataSchema.DTO.Regalos;
using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers.Regalos
{
    [ApiController]
    [Route("eventos/{id_evento}/regalos/transferencias")]
    [Authorize]
    public class regalosTransferenciasController : ControllerBase
    {
        private readonly IRegalosTransferenciasService _service;

        public regalosTransferenciasController(IRegalosTransferenciasService service)
        {
            _service = service;
        }

        // GET /eventos/{id_evento}/regalos/transferencias
        // GET /eventos/{id_evento}/regalos/transferencias?activo=true|false  (opcional)
        [HttpGet]
        public async Task<ActionResult> GetAll(long id_evento, [FromQuery] bool? activo = null)
        {
            var list = await _service.ListarAsync(id_evento, activo);
            return Ok(list);
        }

        // POST /eventos/{id_evento}/regalos/transferencias  (upsert)
        [HttpPost]
        public async Task<ActionResult> Upsert(long id_evento, [FromBody] RegalosTransferenciaUpsertDTO dto)
        {
            dto.id_evento = id_evento;

            try
            {
                var res = await _service.UpsertAsync(dto);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /eventos/{id_evento}/regalos/transferencias/{id}/activo?activo=true|false
        [HttpPut("{id_evento_regalo_transferencia}/activo")]
        public async Task<ActionResult> SetActivo(long id_evento, long id_evento_regalo_transferencia, [FromQuery] bool activo)
        {
            var ok = await _service.SetActivoAsync(id_evento, id_evento_regalo_transferencia, activo);
            if (!ok) return NotFound(new { error = "Registro no encontrado." });

            return Ok(new { ok = true });
        }
    }
}