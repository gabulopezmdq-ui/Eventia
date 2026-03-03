using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("eventos/{id_evento}/musica")]
    public class evento_musica_sugerencias_moderacionController : ControllerBase
    {
        private readonly DataContext _context;

        public evento_musica_sugerencias_moderacionController(DataContext context)
        {
            _context = context;
        }

        // PUT /eventos/{id_evento}/musica/sugerencias/moderar
        [HttpPut("sugerencias/moderar")]
        public async Task<ActionResult> Moderar(long id_evento, [FromBody] MusicaSugerenciaModerarDTO req)
        {
            if (req == null) return BadRequest(new { error = "Body inválido." });
            if (req.id_invitado_musica_sugerencia <= 0) return BadRequest(new { error = "id_invitado_musica_sugerencia inválido." });

            var accion = (req.accion ?? "").Trim().ToUpper();
            if (accion != "INCLUIR" && accion != "RECHAZAR" && accion != "PENDIENTE")
                return BadRequest(new { error = "accion inválida. Use INCLUIR, RECHAZAR o PENDIENTE." });

            var sug = await _context.Set<ef_invitado_musica_sugerencias>()
                .FirstOrDefaultAsync(x => x.id_invitado_musica_sugerencia == req.id_invitado_musica_sugerencia && x.id_evento == id_evento && x.activo);

            if (sug == null) return NotFound(new { error = "Sugerencia no encontrada para el evento." });

            var estado = await _context.Set<ef_evento_musica_sugerencias_estado>()
                .FirstOrDefaultAsync(x => x.id_invitado_musica_sugerencia == sug.id_invitado_musica_sugerencia);

            if (estado == null)
            {
                estado = new ef_evento_musica_sugerencias_estado
                {
                    id_evento = id_evento,
                    id_invitado_musica_sugerencia = sug.id_invitado_musica_sugerencia,
                    estado = "PENDIENTE",
                    nota_interna = null,
                    id_evento_musica_playlist = null
                };
                await _context.Set<ef_evento_musica_sugerencias_estado>().AddAsync(estado);
            }

            if (accion == "RECHAZAR")
            {
                estado.estado = "RECHAZADA";
                estado.nota_interna = string.IsNullOrWhiteSpace(req.nota_interna) ? null : req.nota_interna.Trim();
                estado.id_evento_musica_playlist = null; // queda sin vínculo
                await _context.SaveChangesAsync();
                return Ok(new { ok = true, estado = estado.estado });
            }

            if (accion == "PENDIENTE")
            {
                estado.estado = "PENDIENTE";
                estado.nota_interna = string.IsNullOrWhiteSpace(req.nota_interna) ? null : req.nota_interna.Trim();
                // no tocamos playlist si ya existía (podés decidir otra regla más adelante)
                await _context.SaveChangesAsync();
                return Ok(new { ok = true, estado = estado.estado, id_evento_musica_playlist = estado.id_evento_musica_playlist });
            }

            // INCLUIR -> crear playlist si no estaba ya vinculada
            if (estado.id_evento_musica_playlist == null)
            {
                var playlistItem = new ef_evento_musica_playlist
                {
                    id_evento = id_evento,
                    id_evento_musica_momento = req.id_evento_musica_momento,
                    titulo = sug.titulo,
                    artista = sug.artista,
                    link = sug.link,
                    orden = req.orden ?? 1,
                    activo = true
                };

                await _context.Set<ef_evento_musica_playlist>().AddAsync(playlistItem);
                await _context.SaveChangesAsync(); // para obtener id

                estado.id_evento_musica_playlist = playlistItem.id_evento_musica_playlist;
            }

            estado.estado = "INCLUIDA";
            estado.nota_interna = string.IsNullOrWhiteSpace(req.nota_interna) ? null : req.nota_interna.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ok = true,
                estado = estado.estado,
                id_evento_musica_playlist = estado.id_evento_musica_playlist
            });
        }
    }
}