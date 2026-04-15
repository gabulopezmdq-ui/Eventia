using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class eventosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_eventos> _serviceGenerico;
        private readonly ILogger<eventosController> _logger;
        private readonly IEventosService _eventos;

        public eventosController(DataContext context, ILogger<eventosController> logger, ICRUDService<ef_eventos> serviceGenerico, IEventosService eventos)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _eventos = eventos;
        }

     

        //[HttpDelete]
        //public async Task<IActionResult> Delete(int Id)
        //{
        //    await _serviceGenerico.Delete(Id);
        //    return Ok();
        //}

        //Eventos chatGPT
        [Authorize]
        [HttpGet("mios")]
        public async Task<ActionResult<List<EventoResponse>>> MisEventos()
        {
            long idUsuario = User.GetUserId();
            var result = await _eventos.MisEventosAsync(idUsuario);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("GetEvento")]
        public async Task<ActionResult<EventoResponse>> GetEvento(long idEvento)
        {
            long idUsuario = User.GetUserId();
            var ev = await _eventos.GetEventoMioAsync(idUsuario, idEvento);
            return Ok(ev);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<EventoResponse>> Crear([FromBody] EventoCreateRequest req)
        {
            long idUsuario = User.GetUserId();
            var creado = await _eventos.CrearEventoAsync(idUsuario, req);
            return Ok(creado);
        }

        [Authorize]
        [HttpPut("{idEvento:long}/general")]
        public async Task<ActionResult<EventoResponse>> UpdateGeneral(
            long idEvento,
            [FromBody] EventoUpdateGeneralRequest req)
        {
            long idUsuario = User.GetUserId();
            var updated = await _eventos.UpdateGeneralAsync(idUsuario, idEvento, req);
            return Ok(updated);
        }

        [Authorize]
        [HttpPut("{idEvento:long}/acceso-default")]
        public async Task<IActionResult> SetAccesoDefault([FromRoute] long idEvento, [FromQuery] long idAcceso)
        {
            long idUsuario = User.GetUserId();

            // seguridad: el usuario debe pertenecer al evento
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            // validar que el acceso exista y sea del evento
            bool accesoOk = await _context.Set<ef_evento_accesos>()
                .AnyAsync(a => a.id_acceso == idAcceso && a.id_evento == idEvento && a.activo == true);

            if (!accesoOk)
                return BadRequest("El acceso no existe, no pertenece al evento, o está inactivo.");

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null) return NotFound("Evento inexistente.");

            ev.id_acceso_default = idAcceso;
            ev.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_evento = idEvento, id_acceso_default = idAcceso });
        }

        [Authorize]
        [HttpPut("{idEvento:long}/configuracion")]
        public async Task<ActionResult<EventoResponse>> UpdateConfiguracion(long idEvento, [FromBody] EventoUpdateConfiguracionRequest req)
        {
            long idUsuario = User.GetUserId();
            var updated = await _eventos.UpdateConfiguracionAsync(idUsuario, idEvento, req);
            return Ok(updated);
        }

    }
}
