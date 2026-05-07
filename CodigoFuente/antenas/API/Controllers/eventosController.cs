using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services;
using API.Services.Staff;
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
        private readonly IStaffService _staffService;

        public eventosController(DataContext context, ILogger<eventosController> logger, ICRUDService<ef_eventos> serviceGenerico, IEventosService eventos, IStaffService staffService)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _eventos = eventos;
            _staffService = staffService;
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
            var creado = await _eventos.CrearEventoAsync(idUsuario, req, User.IsStaff());
            return Ok(creado);
        }

        [Authorize]
        [HttpPut("{idEvento:long}/general")]
        public async Task<ActionResult<EventoResponse>> UpdateGeneral(
            long idEvento,
            [FromBody] EventoUpdateGeneralRequest req)
        {
            long idUsuario = User.GetUserId();
            var updated = await _eventos.UpdateGeneralAsync(idUsuario, idEvento, req, User.IsStaff());
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
            var updated = await _eventos.UpdateConfiguracionAsync(idUsuario, idEvento, req, User.IsStaff());
            return Ok(updated);
        }

        [Authorize]
        [HttpGet("{idEvento:long}/reporte-catering-mesas")]
        public async Task<ActionResult<List<MesaRestriccionesDTO>>> ReporteRestriccionesMesas(long idEvento)
        {
            var result = await _eventos.GetReporteRestriccionesMesasAsync(idEvento);
            return Ok(result);
        }

        // ─────────────────────────────────────────────
        // STAFF / COLABORADORES
        // ─────────────────────────────────────────────

        [Authorize]
        [HttpGet("{idEvento:long}/staff")]
        public async Task<ActionResult<IEnumerable<EventoStaffDTO>>> GetStaff(long idEvento)
        {
            try
            {
                var result = await _eventos.GetStaffAsync(idEvento, User.GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [Authorize]
        [HttpGet("{idEvento:long}/staff/codigos")]
        public async Task<ActionResult<IEnumerable<object>>> GetStaffCodigos(long idEvento)
        {
            try
            {
                var result = await _eventos.GetStaffCodigosAsync(idEvento, User.GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [Authorize]
        [HttpPost("{idEvento:long}/staff")]
        public async Task<ActionResult<object>> AddStaff(long idEvento, [FromBody] AddEventoStaffRequest req)
        {
            try
            {
                var result = await _eventos.AddStaffAsync(idEvento, req, User.GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [Authorize]
        [HttpPost("{idEvento:long}/staff/crear")]
        public async Task<ActionResult<object>> CrearStaffEvento(long idEvento, [FromBody] AddEventoStaffRequest req)
        {
            try
            {
                // 1. Delegar creación a StaffService (Responsable de ef_staff y códigos)
                var staffCreado = await _staffService.CrearStaffEventoAsync(
                    idEvento, 
                    req.Nombre ?? "", 
                    req.Apellido ?? "", 
                    req.Email ?? "", 
                    req.IdRol
                );

                // 2. Delegar asignación a EventosService (Responsable de ef_evento_usuarios)
                req.IdStaff = staffCreado.id_staff;
                var asignacion = await _eventos.AddStaffAsync(idEvento, req, User.GetUserId());

                return Ok(asignacion);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [Authorize]
        [HttpPut("{idEvento:long}/staff/{idEventoUsuario:long}")]
        public async Task<IActionResult> UpdateStaff(long idEvento, long idEventoUsuario, [FromBody] UpdateEventoStaffRequest req)
        {
            try
            {
                await _eventos.UpdateStaffAsync(idEvento, idEventoUsuario, req, User.GetUserId());
                return Ok(new { ok = true });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [Authorize]
        [HttpDelete("{idEvento:long}/staff/{idEventoUsuario:long}")]
        public async Task<IActionResult> DeleteStaff(long idEvento, long idEventoUsuario)
        {
            try
            {
                await _eventos.DeleteStaffAsync(idEvento, idEventoUsuario, User.GetUserId());
                return Ok(new { ok = true });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [Authorize]
        [HttpPost("staff/aceptar-invitacion")]
        public async Task<IActionResult> AceptarInvitacionStaff([FromQuery] string token)
        {
            try
            {
                var result = await _eventos.AceptarInvitacionStaffAsync(token, User.GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(); }
            catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }
}
