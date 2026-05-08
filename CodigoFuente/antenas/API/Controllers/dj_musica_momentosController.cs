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
    public class dj_musica_momentosController : ControllerBase
    {
        private readonly DataContext _context;

        public dj_musica_momentosController(DataContext context)
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

        // GET /dj/{token}/musica/momentos
        [HttpGet("momentos")]
        public async Task<ActionResult> GetMomentos(string token)
        {
            var link = await ValidarToken(token, "MUSICA_READ");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            var momentos = await _context.Set<ef_evento_musica_momentos>()
                .Where(x => x.id_evento == link.id_evento && x.activo)
                .OrderBy(x => x.orden)
                .ThenBy(x => x.nombre)
                .Select(x => new
                {
                    id_evento_musica_momento = x.id_evento_musica_momento,
                    nombre = x.nombre,
                    orden = x.orden
                })
                .ToListAsync();

            // Para que el front pueda filtrar playlist sin momento:
            // id = null y nombre = "(Sin momento)"
            var response = new object[]
            {
                new { id_evento_musica_momento = (long?)null, nombre = "(Sin momento)", orden = 0 }
            }.Concat(momentos.Cast<object>()).ToList();

            return Ok(response);
        }

        // (Opcional) GET /dj/{token}/musica/opciones_orden
        [HttpGet("opciones_orden")]
        public async Task<ActionResult> GetOpcionesOrden(string token)
        {
            var link = await ValidarToken(token, "MUSICA_READ");
            if (link == null) return Unauthorized(new { error = "Token inválido, vencido o sin permisos." });

            return Ok(new
            {
                playlist_si = new[] { "momento", "orden", "titulo", "artista" },
                bloqueos_no = new[] { "artista", "titulo", "fecha" },
                order_dir = new[] { "asc", "desc" }
            });
        }
    }
}

