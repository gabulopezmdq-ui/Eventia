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
    public class dj_musicaController : ControllerBase
    {
        private readonly DataContext _context;

        public dj_musicaController(DataContext context)
        {
            _context = context;
        }

        private async Task<ef_evento_links?> ValidarToken(string token, string scopeRequerido)
        {
            var link = await _context.Set<ef_evento_links>()
                .FirstOrDefaultAsync(x => x.token == token && x.activo);

            if (link == null) return null;

            if (link.fecha_vencimiento.HasValue && link.fecha_vencimiento.Value < DateTimeOffset.UtcNow)
                return null;

            if (!string.IsNullOrWhiteSpace(link.scopes))
            {
                var scopes = JsonSerializer.Deserialize<string[]>(link.scopes) ?? new string[0];
                if (!scopes.Contains(scopeRequerido))
                    return null;
            }

            return link;
        }

        // GET /dj/{token}/musica/si?momento=...&id_momento=...&order_by=...&order_dir=...
        [HttpGet("si")]
        public async Task<ActionResult> GetPlaylist(
            string token,
            [FromQuery] string? momento = null,
            [FromQuery] long? id_momento = null,
            [FromQuery] string? order_by = "momento",
            [FromQuery] string? order_dir = "asc")
        {
            var link = await ValidarToken(token, "MUSICA_READ");
            if (link == null) return Unauthorized(new { error = "Token inválido o sin permisos." });

            var q =
                from p in _context.Set<ef_evento_musica_playlist>()
                join m in _context.Set<ef_evento_musica_momentos>()
                    on p.id_evento_musica_momento equals m.id_evento_musica_momento into mj
                from m in mj.DefaultIfEmpty()
                where p.id_evento == link.id_evento && p.activo
                select new
                {
                    id_playlist = p.id_evento_musica_playlist,
                    id_momento = (long?)p.id_evento_musica_momento,
                    momento = m != null ? m.nombre : "",
                    orden_momento = m != null ? m.orden : 9999,
                    orden_tema = p.orden,
                    titulo = p.titulo,
                    artista = p.artista ?? "",
                    link = p.link ?? ""
                };

            // Filtros
            if (id_momento.HasValue && id_momento.Value > 0)
                q = q.Where(x => x.id_momento == id_momento.Value);

            if (!string.IsNullOrWhiteSpace(momento))
                q = q.Where(x => x.momento.ToLower() == momento.Trim().ToLower());

            // Orden
            var desc = (order_dir ?? "asc").Trim().ToLower() == "desc";
            var ob = (order_by ?? "momento").Trim().ToLower();

            if (ob == "artista")
                q = desc ? q.OrderByDescending(x => x.artista).ThenByDescending(x => x.titulo)
                         : q.OrderBy(x => x.artista).ThenBy(x => x.titulo);
            else if (ob == "titulo")
                q = desc ? q.OrderByDescending(x => x.titulo)
                         : q.OrderBy(x => x.titulo);
            else if (ob == "orden")
                q = desc ? q.OrderByDescending(x => x.orden_momento).ThenByDescending(x => x.orden_tema)
                         : q.OrderBy(x => x.orden_momento).ThenBy(x => x.orden_tema);
            else // momento (default)
                q = desc ? q.OrderByDescending(x => x.orden_momento).ThenByDescending(x => x.orden_tema)
                         : q.OrderBy(x => x.orden_momento).ThenBy(x => x.orden_tema);

            var data = await q.ToListAsync();
            return Ok(data);
        }

        // GET /dj/{token}/musica/no?search=...&order_by=...&order_dir=...
        [HttpGet("no")]
        public async Task<ActionResult> GetBloqueos(
            string token,
            [FromQuery] string? search = null,
            [FromQuery] string? order_by = "artista",
            [FromQuery] string? order_dir = "asc")
        {
            var link = await ValidarToken(token, "MUSICA_READ");
            if (link == null) return Unauthorized(new { error = "Token inválido o sin permisos." });

            var q = _context.Set<ef_evento_musica_bloqueos>()
                .Where(x => x.id_evento == link.id_evento && x.activo);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                q = q.Where(x =>
                    (x.titulo ?? "").ToLower().Contains(s) ||
                    (x.artista ?? "").ToLower().Contains(s) ||
                    (x.nota ?? "").ToLower().Contains(s));
            }

            var desc = (order_dir ?? "asc").Trim().ToLower() == "desc";
            var ob = (order_by ?? "artista").Trim().ToLower();

            if (ob == "titulo")
                q = desc ? q.OrderByDescending(x => x.titulo).ThenByDescending(x => x.artista)
                         : q.OrderBy(x => x.titulo).ThenBy(x => x.artista);
            else if (ob == "fecha")
                q = desc ? q.OrderByDescending(x => x.fecha_alta)
                         : q.OrderBy(x => x.fecha_alta);
            else // artista default
                q = desc ? q.OrderByDescending(x => x.artista).ThenByDescending(x => x.titulo)
                         : q.OrderBy(x => x.artista).ThenBy(x => x.titulo);

            var data = await q.Select(x => new { x.titulo, x.artista, x.link, x.nota }).ToListAsync();
            return Ok(data);
        }
    }
}
