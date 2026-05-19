using API.DataSchema.DTO.Regalos;
using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace API.Controllers.Regalos
{
    [ApiController]
    [Route("eventos/{id_evento}/regalos/lista")]
    [Authorize]
    public class regalosListaController : ControllerBase
    {
        private readonly IRegalosListaService _service;

        public regalosListaController(IRegalosListaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult> GetItems(long id_evento)
        {
            var items = await _service.ListarItemsAsync(id_evento);
            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult> CrearItem(long id_evento, [FromBody] RegalosListaCrearItemDTO req)
        {
            req.id_evento = id_evento;

            try
            {
                var dto = await _service.CrearItemAsync(req);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id_regalo_item}/visible")]
        public async Task<ActionResult> SetVisible(long id_evento, long id_regalo_item, [FromQuery] bool visible)
        {
            var ok = await _service.SetVisibleItemAsync(id_evento, id_regalo_item, visible);
            if (!ok) return NotFound(new { error = "Item no encontrado." });

            return Ok(new { ok = true });
        }
    }
}