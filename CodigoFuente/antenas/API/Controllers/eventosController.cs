using  API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using  API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
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

        //[Authorize(Roles = "SUPERADMIN")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<ef_eventos>>> Get() //TODO: el método no contiene await, ya que devuelve un IEnumerable, que no puede ser awaiteado, ver como se puede implementar
        {
            return Ok(_serviceGenerico.GetAll());
        }

        //[HttpGet("GetByActivo")]
        //public async Task<ActionResult<IEnumerable<ef_eventos>>> GetByVigente([FromQuery] string activo = null)
        //{
        //    var result = await _serviceGenerico.GetByVigente(activo);
        //    return Ok(result);
        //}

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_eventos>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        //[HttpGet("GetByName")]
        //public async Task<ActionResult<ef_usuarios>> Get(string Name)
        //{
        //    return Ok(await _serviceGenerico.GetByParam(u => u.Descripcion == Name));
        //}

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_eventos evento)
        {
            await _serviceGenerico.Add(evento);
            return Ok(evento);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        [HttpPut]
        public async Task<ActionResult<ef_eventos>> Update([FromBody] ef_eventos evento)
        {
            await _serviceGenerico.Update(evento);
            return Ok(evento);
        }

        //Eventos chatGPT
        [HttpGet("mios")]
        public async Task<ActionResult<List<EventoResponse>>> MisEventos()
        {
            long idUsuario = User.GetUserId();
            var result = await _eventos.MisEventosAsync(idUsuario);
            return Ok(result);
        }

        [HttpGet("GetEvento")]
        public async Task<ActionResult<EventoResponse>> GetEvento(long idEvento)
        {
            long idUsuario = User.GetUserId();
            var ev = await _eventos.GetEventoMioAsync(idUsuario, idEvento);
            return Ok(ev);
        }

        [HttpPost]
        public async Task<ActionResult<EventoResponse>> Crear([FromBody] EventoCreateRequest req)
        {
            long idUsuario = User.GetUserId();
            var creado = await _eventos.CrearEventoAsync(idUsuario, req);
            return Ok(creado);
        }

    }
}
