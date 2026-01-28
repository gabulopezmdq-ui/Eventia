using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize(Roles = "SUPERADMIN")]    // solo superadmin
    [Route("[controller]")]             
    public class adminEventosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_eventos> _serviceGenerico;
        private readonly ILogger<adminEventosController> _logger;
        private readonly IEventosService _eventos;

        public adminEventosController(DataContext context, ILogger<adminEventosController> logger, ICRUDService<ef_eventos> serviceGenerico, IEventosService eventos)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
            _eventos = eventos;
        }

        // (Opcional) GetAll genérico (devuelve todo, sin filtro)
        // GET /adminEventos/GetAll
        [HttpGet("GetAll")]
        public ActionResult<IEnumerable<ef_eventos>> GetAll()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        // Admin: listar eventos (por estado opcional)
        // GET /adminEventos/Listar?estado=B
        [HttpGet("Listar")]
        public async Task<ActionResult<List<EventoResponse>>> Listar([FromQuery] string estado = null)
        {
            var result = await _eventos.AdminListarEventosAsync(estado);
            return Ok(result);
        }

        // Admin: obtener evento (sin validar pertenencia)
        // GET /adminEventos/GetEvento?idEvento=123
        [HttpGet("GetEvento")]
        public async Task<ActionResult<EventoResponse>> GetEvento([FromQuery] long idEvento)
        {
            var ev = await _eventos.AdminGetEventoAsync(idEvento);
            return Ok(ev);
        }

        // Admin: activar evento
        // POST /adminEventos/Activar?idEvento=123
        [HttpPost("Activar")]
        public async Task<IActionResult> Activar([FromQuery] long idEvento)
        {
            long idUsuarioAdmin = User.GetUserId();
            await _eventos.ActivarEventoAdminAsync(idEvento, idUsuarioAdmin);
            return Ok(new { message = "Evento activado." });
        }
    }
}