using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class cuenta_eventosController : ControllerBase
    {
        private readonly IEventosService _eventos;

        public cuenta_eventosController(IEventosService eventos)
        {
            _eventos = eventos;
        }

        [Authorize]
        [HttpGet("mis-eventos")]
        public async Task<ActionResult<List<EventoResponse>>> MisEventosCuenta(
            [FromQuery] long idCuenta,
            [FromQuery] long? idUnidad,
            [FromQuery] long? idCliente,
            [FromQuery] string? estado)
        {
            long idUsuario = User.GetUserId();

            var result = await _eventos.MisEventosCuentaAsync(
                idUsuario,
                idCuenta,
                idUnidad,
                idCliente,
                estado);

            return Ok(result);
        }

        [Authorize]
        [HttpGet("{idEvento:long}")]
        public async Task<ActionResult<EventoResponse>> GetEventoCuenta(long idEvento)
        {
            long idUsuario = User.GetUserId();
            var ev = await _eventos.GetEventoMioAsync(idUsuario, idEvento);
            return Ok(ev);
        }
    }
}
