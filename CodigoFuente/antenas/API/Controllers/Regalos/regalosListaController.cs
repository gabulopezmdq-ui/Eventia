using API.DataSchema.DTO.Regalos;
using API.Services.Regalos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
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

        // ─────────────────────────────
        // GET /eventos/{id_evento}/regalos/lista
        // ─────────────────────────────
        [HttpGet]
        public async Task<ActionResult> GetItems(long id_evento)
        {
            var items = await _service.ListarItemsAsync(id_evento);
            return Ok(items);
        }

        // ─────────────────────────────
        // GET /eventos/{id_evento}/regalos/lista/{id_regalo_item}
        // Para precargar modal desde backend (si lo querés)
        // ─────────────────────────────
        [HttpGet("{id_regalo_item}")]
        public async Task<ActionResult> GetItemById(long id_evento, long id_regalo_item)
        {
            var items = await _service.ListarItemsAsync(id_evento);
            var item = items.FirstOrDefault(x => x.id_regalo_item == id_regalo_item);
            if (item == null) return NotFound(new { error = "Item no encontrado." });
            return Ok(item);
        }

        // ─────────────────────────────
        // POST /eventos/{id_evento}/regalos/lista
        // Crear item
        // ─────────────────────────────
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

        // ─────────────────────────────
        // PUT /eventos/{id_evento}/regalos/lista/{id_regalo_item}
        // Editar item (NO duplica)
        // ─────────────────────────────
        [HttpPut("{id_regalo_item}")]
        public async Task<ActionResult> UpdateItem(long id_evento, long id_regalo_item, [FromBody] RegalosListaUpdateItemDTO req)
        {
            try
            {
                var ok = await _service.UpdateItemAsync(id_evento, id_regalo_item, req);
                if (!ok) return NotFound(new { error = "Item no encontrado." });

                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ─────────────────────────────
        // POST /eventos/{id_evento}/regalos/lista/{id_regalo_item}/duplicar
        // Duplica item al final (orden = max+1)
        // ─────────────────────────────
        [HttpPost("{id_regalo_item}/duplicar")]
        public async Task<ActionResult> Duplicar(long id_evento, long id_regalo_item)
        {
            try
            {
                var dto = await _service.DuplicarItemAsync(id_evento, id_regalo_item);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ─────────────────────────────
        // PUT /eventos/{id_evento}/regalos/lista/{id_regalo_item}/visible?visible=true|false
        // ─────────────────────────────
        [HttpPut("{id_regalo_item}/visible")]
        public async Task<ActionResult> SetVisible(long id_evento, long id_regalo_item, [FromQuery] bool visible)
        {
            var ok = await _service.SetVisibleItemAsync(id_evento, id_regalo_item, visible);
            if (!ok) return NotFound(new { error = "Item no encontrado." });

            return Ok(new { ok = true });
        }
    }
}