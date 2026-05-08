using API.DataSchema;
using API.Services.Musica;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("eventos/{id_evento}/musica/export")]
    public class evento_musica_exportController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_musica_exportController> _logger;

        public evento_musica_exportController(DataContext context, ILogger<evento_musica_exportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Lista "SI": playlist del organizador
        [HttpGet("si.csv")]
        public async Task<IActionResult> ExportSi(long id_evento)
        {
            // Traemos playlist + momento (si existe)
            var data = await (
                from p in _context.Set<ef_evento_musica_playlist>()
                join m in _context.Set<ef_evento_musica_momentos>()
                    on p.id_evento_musica_momento equals m.id_evento_musica_momento into mj
                from m in mj.DefaultIfEmpty()
                where p.id_evento == id_evento && p.activo
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
            return File(bytes, "text/csv", $"eventia_musica_si_evento_{id_evento}.csv");
        }

        // Lista "NO": bloqueos del organizador
        [HttpGet("no.csv")]
        public async Task<IActionResult> ExportNo(long id_evento)
        {
            var data = await _context.Set<ef_evento_musica_bloqueos>()
                .Where(x => x.id_evento == id_evento && x.activo)
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
            return File(bytes, "text/csv", $"eventia_musica_no_evento_{id_evento}.csv");
        }
    }
}
