using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class cuenta_hospedaje_plantillasController : ControllerBase
    {
        private readonly ICuentaHospedajePlantillasService _svc;

        public cuenta_hospedaje_plantillasController(ICuentaHospedajePlantillasService svc)
        {
            _svc = svc;
        }

        [HttpGet("MisPlantillas")]
        public async Task<IActionResult> MisPlantillas([FromQuery] bool soloActivas = true, [FromQuery] long? idUnidad = null)
        {
            long idUsuario = User.GetUserId();
            var list = await _svc.MisPlantillasAsync(idUsuario, soloActivas, idUnidad);
            return Ok(list);
        }

        [HttpGet("{idPlantilla:long}")]
        public async Task<IActionResult> GetPlantilla([FromRoute] long idPlantilla)
        {
            long idUsuario = User.GetUserId();
            var p = await _svc.GetPlantillaAsync(idUsuario, idPlantilla);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpPost("Upsert")]
        public async Task<IActionResult> UpsertPlantilla([FromBody] CuentaHospedajePlantillaUpsertRequestDTO req)
        {
            long idUsuario = User.GetUserId();
            var id = await _svc.CrearOActualizarPlantillaAsync(idUsuario, req);
            return Ok(new { ok = true, id_hospedaje_plantilla = id });
        }

        [HttpGet("{idPlantilla:long}/Items")]
        public async Task<IActionResult> GetItems([FromRoute] long idPlantilla)
        {
            long idUsuario = User.GetUserId();
            var items = await _svc.GetItemsAsync(idUsuario, idPlantilla);
            return Ok(items);
        }

        [HttpPost("{idPlantilla:long}/UpsertItem")]
        public async Task<IActionResult> UpsertItem([FromRoute] long idPlantilla, [FromBody] CuentaHospedajePlantillaItemUpsertRequestDTO req)
        {
            long idUsuario = User.GetUserId();
            var idItem = await _svc.UpsertItemAsync(idUsuario, idPlantilla, req);
            return Ok(new { ok = true, id_hospedaje_plantilla_item = idItem });
        }

        [HttpDelete("{idPlantilla:long}/DeleteItem/{idItem:long}")]
        public async Task<IActionResult> DeleteItem([FromRoute] long idPlantilla, [FromRoute] long idItem)
        {
            long idUsuario = User.GetUserId();
            var ok = await _svc.DeleteItemAsync(idUsuario, idPlantilla, idItem);
            return Ok(new { ok = ok });
        }

        [HttpPost("{idPlantilla:long}/AplicarAEvento")]
        public async Task<IActionResult> AplicarAEvento([FromRoute] long idPlantilla, [FromBody] CuentaHospedajePlantillaAplicarRequestDTO req)
        {
            long idUsuario = User.GetUserId();
            var resp = await _svc.AplicarAEventoAsync(idUsuario, idPlantilla, req);
            return Ok(resp);
        }
    }
}