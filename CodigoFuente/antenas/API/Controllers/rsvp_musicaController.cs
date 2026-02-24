using API.DataSchema;
using API.DataSchema.DTO;
using API.Services;
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
    [Route("rsvp")]
    public class rsvp_musicaController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<rsvp_musicaController> _logger;

        public rsvp_musicaController(DataContext context, ILogger<rsvp_musicaController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private async Task<long> GetFeatureId(string codigo)
        {
            return await _context.Set<ef_param_features>()
                .Where(x => x.codigo == codigo && x.activo)
                .Select(x => x.id_feature)
                .FirstOrDefaultAsync();
        }

        private async Task<bool> IsFeatureActiva(long id_evento, string codigo)
        {
            var idFeature = await GetFeatureId(codigo);
            if (idFeature <= 0) return false;

            return await _context.Set<ef_evento_features>()
                .AnyAsync(x => x.id_evento == id_evento && x.id_feature == idFeature && x.activo);
        }

        // PUT /rsvp/{token}/musica/sugerir
        [HttpPut("{token}/musica/sugerir")]
        public async Task<ActionResult> Sugerir(string token, [FromBody] dto_musica_sugerencia_request request)
        {
            var invitado = await _context.Set<ef_invitados>()
                .FirstOrDefaultAsync(x => x.rsvp_token == token);

            if (invitado == null)
                return NotFound(new { error = "Token inválido." });

            if (!await IsFeatureActiva(invitado.id_evento, "MUSICA_SUGERENCIAS"))
                return BadRequest(new { error = "MUSICA_SUGERENCIAS no está habilitada para este evento." });

            if (request == null || request.item == null)
                return BadRequest(new { error = "Body inválido." });

            var item = request.item;

            if (string.IsNullOrWhiteSpace(item.titulo))
                return BadRequest(new { error = "El título del tema es obligatorio." });

            // Por ahora: 1 sugerencia (luego lo atás a plan)
            var cantidadActivas = await _context.Set<ef_invitado_musica_sugerencias>()
                .CountAsync(x => x.id_evento == invitado.id_evento && x.id_invitado == invitado.id_invitado && x.activo);

            if (cantidadActivas >= 1)
                return BadRequest(new { error = "Por ahora solo se permite 1 sugerencia por invitado. (Luego será por plan)" });

            var normalizado = MusicaHelperService.Normalizar(item.titulo, item.artista);
            var hash = MusicaHelperService.Sha256Hex(normalizado);

            // Evitar duplicado exacto por el mismo invitado
            var existe = await _context.Set<ef_invitado_musica_sugerencias>()
                .AnyAsync(x => x.id_invitado == invitado.id_invitado && x.hash_normalizado == hash);

            if (existe)
                return BadRequest(new { error = "Ya sugeriste ese tema." });

            var sug = new ef_invitado_musica_sugerencias
            {
                id_evento = invitado.id_evento,
                id_invitado = invitado.id_invitado,
                titulo = item.titulo.Trim(),
                artista = string.IsNullOrWhiteSpace(item.artista) ? null : item.artista.Trim(),
                link = string.IsNullOrWhiteSpace(item.link) ? null : item.link.Trim(),
                nota = string.IsNullOrWhiteSpace(item.nota) ? null : item.nota.Trim(),
                hash_normalizado = hash,
                activo = true
            };

            await _context.Set<ef_invitado_musica_sugerencias>().AddAsync(sug);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_invitado_musica_sugerencia = sug.id_invitado_musica_sugerencia });
        }

        // PUT /rsvp/{token}/musica/votar
        [HttpPut("{token}/musica/votar")]
        public async Task<ActionResult> Votar(string token, [FromBody] dto_musica_voto_request request)
        {
            var invitado = await _context.Set<ef_invitados>()
                .FirstOrDefaultAsync(x => x.rsvp_token == token);

            if (invitado == null)
                return NotFound(new { error = "Token inválido." });

            if (!await IsFeatureActiva(invitado.id_evento, "MUSICA_VOTACION"))
                return BadRequest(new { error = "MUSICA_VOTACION no está habilitada para este evento." });

            if (request == null || request.id_invitado_musica_sugerencia <= 0)
                return BadRequest(new { error = "Sugerencia inválida." });

            // Validar que la sugerencia exista y sea del mismo evento
            var sugerencia = await _context.Set<ef_invitado_musica_sugerencias>()
                .FirstOrDefaultAsync(x =>
                    x.id_invitado_musica_sugerencia == request.id_invitado_musica_sugerencia &&
                    x.id_evento == invitado.id_evento &&
                    x.activo);

            if (sugerencia == null)
                return BadRequest(new { error = "La sugerencia no pertenece al evento o no existe." });

            // UX SIMPLE: si querés “solo voto tu propio tema”, descomentá esta validación:
            // if (sugerencia.id_invitado != invitado.id_invitado)
            //     return BadRequest(new { error = "Solo podés votar tu propia sugerencia." });

            // Upsert voto (1 por invitado por evento)
            var voto = await _context.Set<ef_invitado_musica_votos>()
                .FirstOrDefaultAsync(x => x.id_evento == invitado.id_evento && x.id_invitado == invitado.id_invitado);

            if (voto == null)
            {
                voto = new ef_invitado_musica_votos
                {
                    id_evento = invitado.id_evento,
                    id_invitado = invitado.id_invitado,
                    id_invitado_musica_sugerencia = sugerencia.id_invitado_musica_sugerencia,
                    valor = 1
                };
                await _context.Set<ef_invitado_musica_votos>().AddAsync(voto);
            }
            else
            {
                voto.id_invitado_musica_sugerencia = sugerencia.id_invitado_musica_sugerencia;
            }

            await _context.SaveChangesAsync();

            return Ok(new { ok = true });
        }
    }
}