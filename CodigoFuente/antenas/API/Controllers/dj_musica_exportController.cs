using API.DataSchema;
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
    public class dj_musica_exportController : ControllerBase
    {
        private readonly DataContext _context;

        public dj_musica_exportController(DataContext context)
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

            // opcional: asegurar que sea tipo DJ_MUSICA
            // if (link.tipo != "DJ_MUSICA") return null;

            return link;
        }

        // GET /dj/{token}/musica/export/si.csv
        [HttpGet("si.csv")]
        public async Task<IActionResult> ExportSi(string token)
        {
            var link = await ValidarToken(token, "EXPORT");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            var data = await (
                from p in _context.Set<ef_evento_musica_playlist>()
                join m in _context.Set<ef_evento_musica_momentos>()
                    on p.id_evento_musica_momento equals m.id_evento_musica_momento into mj
                from m in mj.DefaultIfEmpty()
                where p.id_evento == link.id_evento && p.activo
                orderby (m != null ? m.orden : 9999), p.orden, p.id_evento_musica_playlist
                select new
                {
                    momento = m != null ? m.nombre : "",
                    orden_momento = m != null ? m.orden : (int?)null,
                    orden_tema = p.orden,
                    titulo = p.titulo,
                    artista = p.artista,
                    link = p.link
                }
            ).ToListAsync();

            var rows = new List<string[]>();
            rows.Add(new[] { "momento", "orden_momento", "orden_tema", "titulo", "artista", "link" });

            foreach (var x in data)
            {
                rows.Add(new[]
                {
                    x.momento,
                    x.orden_momento?.ToString() ?? "",
                    x.orden_tema.ToString(),
                    x.titulo,
                    x.artista ?? "",
                    x.link ?? ""
                });
            }

            var bytes = CsvHelper.ToCsvBytes(rows);
            return File(bytes, "text/csv", $"eventia_musica_si_evento_{link.id_evento}.csv");
        }

        // GET /dj/{token}/musica/export/no.csv
        [HttpGet("no.csv")]
        public async Task<IActionResult> ExportNo(string token)
        {
            var link = await ValidarToken(token, "EXPORT");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            var data = await _context.Set<ef_evento_musica_bloqueos>()
                .Where(x => x.id_evento == link.id_evento && x.activo)
                .OrderBy(x => x.artista)
                .ThenBy(x => x.titulo)
                .Select(x => new
                {
                    titulo = x.titulo,
                    artista = x.artista,
                    link = x.link,
                    nota = x.nota
                })
                .ToListAsync();

            var rows = new List<string[]>();
            rows.Add(new[] { "titulo", "artista", "link", "nota" });

            foreach (var x in data)
            {
                rows.Add(new[]
                {
                    x.titulo ?? "",
                    x.artista ?? "",
                    x.link ?? "",
                    x.nota ?? ""
                });
            }

            var bytes = CsvHelper.ToCsvBytes(rows);
            return File(bytes, "text/csv", $"eventia_musica_no_evento_{link.id_evento}.csv");
        }
    }
}
