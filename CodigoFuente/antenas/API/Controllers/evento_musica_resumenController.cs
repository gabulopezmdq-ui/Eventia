using API.DataSchema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("eventos/{id_evento}/musica")]
    public class evento_musica_resumenController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_musica_resumenController> _logger;

        public evento_musica_resumenController(DataContext context, ILogger<evento_musica_resumenController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /eventos/{id_evento}/musica/resumen
        [HttpGet("resumen")]
        public async Task<ActionResult> GetResumen(long id_evento)
        {
            // Traer sugerencias activas del evento
            var sugerencias = _context.Set<ef_invitado_musica_sugerencias>()
                .Where(s => s.id_evento == id_evento && s.activo);

            // votos del evento
            var votos = _context.Set<ef_invitado_musica_votos>()
                .Where(v => v.id_evento == id_evento);

            // Ranking: agrupar por hash_normalizado
            var ranking = await sugerencias
                .GroupBy(s => s.hash_normalizado)
                .Select(g => new
                {
                    hash_normalizado = g.Key,
                    titulo = g.Min(x => x.titulo),
                    artista = g.Min(x => x.artista),
                    link_ejemplo = g.Min(x => x.link),
                    cantidad_sugerencias = g.Count(),

                    // votos: cantidad de votos que apuntan a alguna sugerencia dentro de este grupo
                    cantidad_votos = votos.Count(v => g.Select(s => s.id_invitado_musica_sugerencia).Contains(v.id_invitado_musica_sugerencia))
                })
                .OrderByDescending(x => x.cantidad_votos)
                .ThenByDescending(x => x.cantidad_sugerencias)
                .ToListAsync();

            return Ok(ranking);
        }
    }
}
