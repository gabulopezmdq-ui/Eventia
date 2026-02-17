using API.DataSchema.DTO;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class eventos_plantillasController : ControllerBase
    {
        private readonly IEventoPlantillasService _service;

        public eventos_plantillasController(IEventoPlantillasService service)
        {
            _service = service;
        }

        [HttpPost("Aplicar")]
        public async Task<IActionResult> Aplicar([FromQuery] long idEvento, [FromBody] AplicarPlantillaRequestDTO req)
        {
            await _service.AplicarPlantillaAsync(
                idEvento: idEvento,
                idPlantilla: req.id_plantilla,
                fechaBase: req.fecha_base,
                lugarBase: req.lugar_base,
                direccionBase: req.direccion_base,
                latitudBase: req.latitud_base,
                longitudBase: req.longitud_base,
                borrarExistente: req.borrar_existente
            );

            return Ok(new { ok = true });
        }

        [HttpGet("Estructura")]
        public async Task<IActionResult> Estructura([FromQuery] long idEvento)
        {
            var dto = await _service.GetEstructuraEventoAsync(idEvento);
            return Ok(dto);
        }

        [HttpPost("CrearEstructuraManual")]
        public async Task<IActionResult> CrearEstructuraManual([FromQuery] long idEvento, [FromBody] CrearEstructuraManualRequestDTO req)
        {
            await _service.CrearEstructuraManualAsync(idEvento, req, null);
            return Ok(new { ok = true });
        }
    }
}