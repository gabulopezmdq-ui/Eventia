using API.DataSchema;
using API.Services;
using API.Services.Musica;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class evento_musica_bloqueosController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ICRUDService<ef_evento_musica_bloqueos> _serviceGenerico;
        private readonly ILogger<evento_musica_bloqueosController> _logger;

        public evento_musica_bloqueosController(
            DataContext context,
            ILogger<evento_musica_bloqueosController> logger,
            ICRUDService<ef_evento_musica_bloqueos> serviceGenerico)
        {
            _context = context;
            _logger = logger;
            _serviceGenerico = serviceGenerico;
        }

        [HttpGet("GetAll")]
        public ActionResult<IEnumerable<ef_evento_musica_bloqueos>> GetAll()
        {
            return Ok(_serviceGenerico.GetAll());
        }

        [HttpGet("GetById")]
        public async Task<ActionResult<ef_evento_musica_bloqueos>> Get(long Id)
        {
            return Ok(await _serviceGenerico.GetByID(Id));
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_evento_musica_bloqueos item)
        {
            var err = Validar(item);
            if (err != null) return BadRequest(new { error = err });

            item.hash_normalizado = CalcularHash(item.titulo, item.artista);

            await _serviceGenerico.Add(item);
            return Ok(item);
        }

        [HttpPut]
        public async Task<ActionResult<ef_evento_musica_bloqueos>> Update([FromBody] ef_evento_musica_bloqueos item)
        {
            var err = Validar(item);
            if (err != null) return BadRequest(new { error = err });

            item.hash_normalizado = CalcularHash(item.titulo, item.artista);

            await _serviceGenerico.Update(item);
            return Ok(item);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int Id)
        {
            await _serviceGenerico.Delete(Id);
            return Ok();
        }

        private string? Validar(ef_evento_musica_bloqueos item)
        {
            if (item == null) return "Body inválido.";
            if (item.id_evento <= 0) return "id_evento inválido.";

            var tieneTitulo = !string.IsNullOrWhiteSpace(item.titulo);
            var tieneArtista = !string.IsNullOrWhiteSpace(item.artista);

            if (!tieneTitulo && !tieneArtista)
                return "Debe informar al menos título o artista.";

            return null;
        }

        private string CalcularHash(string? titulo, string? artista)
        {
            var normalizado = MusicaHelperService.Normalizar(titulo ?? "", artista);
            return MusicaHelperService.Sha256Hex(normalizado);
        }
    }
}
