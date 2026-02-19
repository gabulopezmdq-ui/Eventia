using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
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

        // Aplica plantilla existente a un evento
        // POST /eventos_plantillas/Aplicar?idEvento=10
        [Authorize]
        [HttpPost("Aplicar")]
        public async Task<IActionResult> Aplicar([FromQuery] long idEvento, [FromBody] AplicarPlantillaRequestDTO req)
        {
            long idUsuario = User.GetUserId();

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

        // Devuelve estructura completa para el editor
        // GET /eventos_plantillas/Estructura?idEvento=10
        [Authorize]
        [HttpGet("Estructura")]
        public async Task<IActionResult> Estructura([FromQuery] long idEvento)
        {
            var dto = await _service.GetEstructuraEventoAsync(idEvento);
            return Ok(dto);
        }

        // Confirma wizard manual:
        // - crea evento_tramos / evento_accesos / evento_acceso_tramos
        // - actualiza solicitud draft D -> P
        // - devuelve id_solicitud (ya en P)
        //
        // POST /eventos_plantillas/CrearEstructuraManual?idEvento=10
        [Authorize]
        [HttpPost("CrearEstructuraManual")]
        public async Task<IActionResult> CrearEstructuraManual([FromQuery] long idEvento, [FromBody] CrearEstructuraManualRequestDTO req)
        {
            long idUsuario = User.GetUserId();

            var idSolicitud = await _service.CrearEstructuraManualAsync(idEvento, req, idUsuario);

            return Ok(new
            {
                ok = true,
                id_solicitud = idSolicitud
            });
        }
    }
}