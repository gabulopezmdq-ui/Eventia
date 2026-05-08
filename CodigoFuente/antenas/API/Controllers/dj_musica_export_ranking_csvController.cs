using API.DataSchema;
using API.Services;
using API.Services.Musica;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("dj/{token}/musica/export")]
    public class dj_musica_export_ranking_csvController : ControllerBase
    {
        private readonly DataContext _context;

        public dj_musica_export_ranking_csvController(DataContext context)
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

        // GET /dj/{token}/musica/export/ranking.csv
        [HttpGet("ranking.csv")]
        public async Task<IActionResult> ExportRankingCsv(string token)
        {
            var link = await ValidarToken(token, "EXPORT");
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
                    titulo = g.Min(x => x.titulo),
                    artista = g.Min(x => x.artista),
                    link = g.Min(x => x.link),
                    cantidad_sugerencias = g.Count(),
                    cantidad_votos = votos.Count(v => g.Select(s => s.id_invitado_musica_sugerencia).Contains(v.id_invitado_musica_sugerencia))
                })
                .OrderByDescending(x => x.cantidad_votos)
                .ThenByDescending(x => x.cantidad_sugerencias)
                .ThenBy(x => x.artista)
                .ThenBy(x => x.titulo)
                .ToListAsync();

            var rows = new List<string[]>();
            rows.Add(new[] { "titulo", "artista", "link", "cantidad_sugerencias", "cantidad_votos" });

            foreach (var r in ranking)
            {
                rows.Add(new[]
                {
                    r.titulo ?? "",
                    r.artista ?? "",
                    r.link ?? "",
                    r.cantidad_sugerencias.ToString(),
                    r.cantidad_votos.ToString()
                });
            }

            var bytes = CsvHelper.ToCsvBytes(rows);
            return File(bytes, "text/csv", $"eventia_musica_ranking_evento_{idEvento}.csv");
        }
    }
}
