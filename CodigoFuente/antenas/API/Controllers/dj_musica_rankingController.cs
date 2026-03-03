using API.DataSchema;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("dj/{token}/musica")]
    public class dj_musica_rankingController : ControllerBase
    {
        private readonly DataContext _context;

        public dj_musica_rankingController(DataContext context)
        {
            _context = context;
        }

        private async Task<ef_evento_links?> ValidarToken(string token, string scopeRequerido)
        {
            var link = await _context.Set<ef_evento_links>()
                .FirstOrDefaultAsync(x => x.token == token && x.activo);

            if (link == null) return null;
            if (link.fecha_vencimiento.HasValue && link.fecha_vencimiento.Value < DateTimeOffset.UtcNow) return null;
            if (string.IsNullOrWhiteSpace(link.scopes)) return null;

            var scopes = JsonSerializer.Deserialize<string[]>(link.scopes) ?? new string[0];
            if (!scopes.Contains(scopeRequerido)) return null;

            return link;
        }

        // GET /dj/{token}/musica/ranking
        [HttpGet("ranking")]
        public async Task<ActionResult> GetRanking(string token)
        {
            var link = await ValidarToken(token, "MUSICA_READ");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            var idEvento = link.id_evento;

            var sugerencias = _context.Set<ef_invitado_musica_sugerencias>()
                .Where(s => s.id_evento == idEvento && s.activo);

            var votos = _context.Set<ef_invitado_musica_votos>()
                .Where(v => v.id_evento == idEvento);

            var ranking = await sugerencias
                .GroupBy(s => s.hash_normalizado)
                .Select(g => new
                {
                    hash_normalizado = g.Key,
                    titulo = g.Min(x => x.titulo),
                    artista = g.Min(x => x.artista),
                    link_ejemplo = g.Min(x => x.link),
                    cantidad_sugerencias = g.Count(),
                    cantidad_votos = votos.Count(v => g.Select(s => s.id_invitado_musica_sugerencia).Contains(v.id_invitado_musica_sugerencia))
                })
                .OrderByDescending(x => x.cantidad_votos)
                .ThenByDescending(x => x.cantidad_sugerencias)
                .ThenBy(x => x.artista)
                .ThenBy(x => x.titulo)
                .ToListAsync();

            return Ok(ranking);
        }
    }
}
