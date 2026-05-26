using API.DataSchema.DTO.Regalos;
using API.Security;
using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers.Regalos
{
    [ApiController]
    [Route("eventos/{id_evento}/regalos/fondo")]
    [Authorize]
    public class regalosFondoController : ControllerBase
    {
        private readonly IRegalosFondoService _service;

        public regalosFondoController(IRegalosFondoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> GetFondo(long id_evento)
        {
            var fondo = await _service.GetFondoByEventoAsync(id_evento);
            return Ok(fondo);
        }

        [HttpPost]
        public async Task<ActionResult> Upsert(long id_evento, [FromBody] RegalosFondoUpsertDTO req)
        {
            req.id_evento = id_evento;

            try
            {
                var dto = await _service.UpsertFondoAsync(req);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("metas")]
        public async Task<ActionResult> Metas(long id_evento)
        {
            var metas = await _service.ListarMetasAsync(id_evento);
            return Ok(metas);
        }

        [HttpPost("metas")]
        public async Task<ActionResult> CrearMeta(long id_evento, [FromBody] RegalosFondoCrearMetaDTO req)
        {
            req.id_evento = id_evento;

            try
            {
                var dto = await _service.CrearMetaAsync(req);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("metas/{id_meta}/visible")]
        public async Task<ActionResult> SetVisibleMeta(long id_evento, long id_meta, [FromQuery] bool visible)
        {
            var ok = await _service.SetVisibleMetaAsync(id_evento, id_meta, visible);
            if (!ok) return NotFound(new { error = "Meta no encontrada." });

            return Ok(new { ok = true });
        }

        [HttpPost("aportes/{id_aporte}/confirmar")]
        public async Task<ActionResult> Confirmar(long id_evento, long id_aporte, [FromBody] RegalosFondoConfirmarAporteDTO req)
        {
            long idUsuario = User.GetUserId();

            try
            {
                var ok = await _service.ConfirmarAporteAsync(id_evento, id_aporte, idUsuario, req);
                if (!ok) return NotFound(new { error = "Aporte no encontrado." });

                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpGet("aportes")]
        public async Task<ActionResult> Aportes(long id_evento, [FromQuery] string? estado = null)
        {
            try
            {
                var list = await _service.ListarAportesAsync(id_evento, estado);
                return Ok(list);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("metas/{id_meta}")]
        public async Task<ActionResult> UpdateMeta(long id_evento, long id_meta, [FromBody] RegalosFondoUpdateMetaDTO req)
        {
            try
            {
                var ok = await _service.UpdateMetaAsync(id_evento, id_meta, req);
                if (!ok) return NotFound(new { error = "Meta no encontrada." });

                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


    }
}