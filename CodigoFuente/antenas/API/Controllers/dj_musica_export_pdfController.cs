using API.DataSchema;
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
    public class dj_musica_export_pdfController : ControllerBase
    {
        private readonly DataContext _context;

        public dj_musica_export_pdfController(DataContext context)
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

            if (string.IsNullOrWhiteSpace(link.scopes))
                return null;

            var scopes = JsonSerializer.Deserialize<string[]>(link.scopes) ?? new string[0];
            if (!scopes.Contains(scopeRequerido))
                return null;

            return link;
        }

        // GET /dj/{token}/musica/export/si.pdf
        [HttpGet("si.pdf")]
        public async Task<IActionResult> ExportSiPdf(string token)
        {
            var link = await ValidarToken(token, "EXPORT");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            var rows = await (
                from p in _context.Set<ef_evento_musica_playlist>()
                join m in _context.Set<ef_evento_musica_momentos>()
                    on p.id_evento_musica_momento equals m.id_evento_musica_momento into mj
                from m in mj.DefaultIfEmpty()
                where p.id_evento == link.id_evento && p.activo
                orderby (m != null ? m.orden : 9999), p.orden, p.id_evento_musica_playlist
                select new PdfMusicaSiRow
                {
                    momento = m != null ? m.nombre : "",
                    orden_tema = p.orden,
                    titulo = p.titulo,
                    artista = p.artista,
                    link = p.link
                }
            ).ToListAsync();

            var doc = new PdfMusicaSiDocument(link.id_evento, rows);
            var bytes = doc.GeneratePdf();

            return File(bytes, "application/pdf", $"eventia_musica_si_evento_{link.id_evento}.pdf");
        }

        // GET /dj/{token}/musica/export/no.pdf
        [HttpGet("no.pdf")]
        public async Task<IActionResult> ExportNoPdf(string token)
        {
            var link = await ValidarToken(token, "EXPORT");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            var rows = await _context.Set<ef_evento_musica_bloqueos>()
                .Where(x => x.id_evento == link.id_evento && x.activo)
                .OrderBy(x => x.artista).ThenBy(x => x.titulo)
                .Select(x => new PdfMusicaNoRow
                {
                    titulo = x.titulo,
                    artista = x.artista,
                    link = x.link,
                    nota = x.nota
                })
                .ToListAsync();

            var doc = new PdfMusicaNoDocument(link.id_evento, rows);
            var bytes = doc.GeneratePdf();

            return File(bytes, "application/pdf", $"eventia_musica_no_evento_{link.id_evento}.pdf");
        }
    }
}
