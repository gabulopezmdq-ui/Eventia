using API.DataSchema;
using API.Services.Musica;
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
    [Route("eventos")]
    public class eventos_dj_linkController : ControllerBase
    {
        private readonly DataContext _context;

        public eventos_dj_linkController(DataContext context)
        {
            _context = context;
        }

        // POST /eventos/{id_evento}/dj_link?vence_en_dias=30
        [HttpPost("{id_evento}/dj_link")]
        public async Task<ActionResult> CreateDjLink(long id_evento, [FromQuery] int vence_en_dias = 30)
        {
            if (id_evento <= 0) return BadRequest(new { error = "id_evento inválido." });
            if (vence_en_dias <= 0) vence_en_dias = 30;

            // Si ya hay uno activo y vigente, lo devolvemos (evita generar 10 links)
            var existente = await _context.Set<ef_evento_links>()
                .Where(x => x.id_evento == id_evento && x.tipo == "DJ_MUSICA" && x.activo)
                .OrderByDescending(x => x.id_evento_link)
                .FirstOrDefaultAsync();

            if (existente != null)
            {
                var vencido = existente.fecha_vencimiento.HasValue && existente.fecha_vencimiento.Value < DateTimeOffset.UtcNow;
                if (!vencido)
                    return Ok(existente);
            }

            // Crear nuevo
            string token;
            do
            {
                token = TokenHelper.NewToken();
            }
            while (await _context.Set<ef_evento_links>().AnyAsync(x => x.token == token));

            var scopes = new[] { "MUSICA_READ", "EXPORT" };
            var scopesJson = JsonSerializer.Serialize(scopes);

            var link = new ef_evento_links
            {
                id_evento = id_evento,
                tipo = "DJ_MUSICA",
                token = token,
                scopes = scopesJson,
                descripcion = "Acceso DJ (solo lectura) - Música",
                fecha_vencimiento = DateTimeOffset.UtcNow.AddDays(vence_en_dias),
                activo = true
            };

            await _context.Set<ef_evento_links>().AddAsync(link);
            await _context.SaveChangesAsync();

            return Ok(link);
        }

        // PUT /eventos/{id_evento}/dj_link/revoke
        [HttpPut("{id_evento}/dj_link/revoke")]
        public async Task<ActionResult> RevokeDjLink(long id_evento)
        {
            var links = await _context.Set<ef_evento_links>()
                .Where(x => x.id_evento == id_evento && x.tipo == "DJ_MUSICA" && x.activo)
                .ToListAsync();

            foreach (var l in links) l.activo = false;

            await _context.SaveChangesAsync();
            return Ok(new { ok = true, revoked = links.Count });
        }
    }
}
