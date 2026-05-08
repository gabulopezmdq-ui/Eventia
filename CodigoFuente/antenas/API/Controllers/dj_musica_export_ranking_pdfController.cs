using API.DataSchema;
using API.Services;
using API.Services.Musica;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("dj/{token}/musica/export")]
    public class dj_musica_export_ranking_pdfController : ControllerBase
    {
        private readonly DataContext _context;

        public dj_musica_export_ranking_pdfController(DataContext context)
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

        // GET /dj/{token}/musica/export/ranking.pdf
        [HttpGet("ranking.pdf")]
        public async Task<IActionResult> ExportRankingPdf(string token)
        {
            var link = await ValidarToken(token, "EXPORT");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            var idEvento = link.id_evento;

            var sugerencias = _context.Set<ef_invitado_musica_sugerencias>()
                .Where(s => s.id_evento == idEvento && s.activo);

            var votos = _context.Set<ef_invitado_musica_votos>()
                .Where(v => v.id_evento == idEvento);

            var rows = await sugerencias
                .GroupBy(s => s.hash_normalizado)
                .Select(g => new PdfMusicaRankingRow
                {
                    titulo = g.Min(x => x.titulo),
                    artista = g.Min(x => x.artista),
                    cantidad_sugerencias = g.Count(),
                    cantidad_votos = votos.Count(v => g.Select(s => s.id_invitado_musica_sugerencia).Contains(v.id_invitado_musica_sugerencia))
                })
                .OrderByDescending(x => x.cantidad_votos)
                .ThenByDescending(x => x.cantidad_sugerencias)
                .ThenBy(x => x.artista)
                .ThenBy(x => x.titulo)
                .ToListAsync();

            var doc = new PdfMusicaRankingDocument(idEvento, rows);
            var bytes = doc.GeneratePdf();

            return File(bytes, "application/pdf", $"eventia_musica_ranking_evento_{idEvento}.pdf");
        }
    }
}
