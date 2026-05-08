using API.DataSchema;
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
    public class evento_musica_sugerencias_adminController : ControllerBase
    {
        private readonly DataContext _context;

        public evento_musica_sugerencias_adminController(DataContext context)
        {
            _context = context;
        }

        // GET /eventos/{id_evento}/musica/sugerencias?estado=PENDIENTE|INCLUIDA|RECHAZADA
        [HttpGet("sugerencias")]
        public async Task<ActionResult> GetSugerencias(long id_evento, [FromQuery] string estado = "PENDIENTE")
        {
            var st = (estado ?? "PENDIENTE").Trim().ToUpper();

            var q =
                from s in _context.Set<ef_invitado_musica_sugerencias>()
                join e in _context.Set<ef_evento_musica_sugerencias_estado>()
                    on s.id_invitado_musica_sugerencia equals e.id_invitado_musica_sugerencia into ej
                from e in ej.DefaultIfEmpty()
                where s.id_evento == id_evento && s.activo
                select new
                {
                    s.id_invitado_musica_sugerencia,
                    s.titulo,
                    s.artista,
                    s.link,
                    s.nota,
                    s.hash_normalizado,
                    estado = (e != null ? e.estado : "PENDIENTE"),
                    nota_interna = (e != null ? e.nota_interna : null),
                    id_evento_musica_playlist = (e != null ? e.id_evento_musica_playlist : (long?)null)
                };

            q = q.Where(x => x.estado == st);

            var data = await q
                .OrderBy(x => x.artista)
                .ThenBy(x => x.titulo)
                .ToListAsync();

            return Ok(data);
        }
    }
}
