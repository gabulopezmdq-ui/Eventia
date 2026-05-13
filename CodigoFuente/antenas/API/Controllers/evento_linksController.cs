using API.DataSchema;
using API.DataSchema.DTO;
using API.Security;
using API.Services.Musica;
using API.Services.Planes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class evento_linksController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<evento_linksController> _logger;

        public evento_linksController(DataContext context, ILogger<evento_linksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<ActionResult> Create([FromBody] eventoLinkCreate req)
        {
            if (req == null) return BadRequest(new { error = "Body inválido." });
            if (req.id_evento <= 0) return BadRequest(new { error = "id_evento inválido." });
            if (string.IsNullOrWhiteSpace(req.tipo)) return BadRequest(new { error = "tipo es obligatorio." });

            long idUsuario = User.GetUserId();

            // seguridad: debe pertenecer al evento
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AsNoTracking()
                .AnyAsync(x => x.id_evento == req.id_evento && x.id_usuario == idUsuario && x.activo == true);

            if (!pertenece)
                return Forbid();

            // evento + plan + estado
            var ev = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .Where(e => e.id_evento == req.id_evento)
                .Select(e => new { e.estado, e.id_plan })
                .SingleOrDefaultAsync();

            if (ev == null)
                return NotFound(new { error = "Evento inexistente." });

            // Si no está activo, no debe generar links (plan pago pendiente, etc.)
            if (ev.estado != "A")
                return BadRequest(new { error = "El evento no está activo. No se pueden generar links en estado pendiente/borrador." });

            if (!ev.id_plan.HasValue)
                return BadRequest(new { error = "El evento no tiene plan asignado. No se pueden generar links." });

            // bloqueo por plan: PERMITIR_GENERAR_LINKS
            var helper = new PlanLimitesHelper(_context);
            await helper.RequireLimiteEnabledAsync(
                req.id_evento,
                "PERMITIR_GENERAR_LINKS",
                "Tu plan no permite generar links. Actualizá el plan para enviar invitaciones."
            );

            // token único
            string token;
            do
            {
                token = TokenHelper.NewToken();
            }
            while (await _context.Set<ef_evento_links>().AnyAsync(x => x.token == token));

            var scopesJson = (req.scopes == null || req.scopes.Length == 0)
                ? null
                : JsonSerializer.Serialize(req.scopes.Distinct().ToArray());

            DateTimeOffset? vence = null;
            if (req.vence_en_dias.HasValue && req.vence_en_dias.Value > 0)
                vence = DateTimeOffset.UtcNow.AddDays(req.vence_en_dias.Value);

            var link = new ef_evento_links
            {
                id_evento = req.id_evento,
                tipo = req.tipo.Trim(),
                token = token,
                scopes = scopesJson,
                descripcion = string.IsNullOrWhiteSpace(req.descripcion) ? null : req.descripcion.Trim(),
                fecha_vencimiento = vence,
                activo = true
            };

            await _context.Set<ef_evento_links>().AddAsync(link);
            await _context.SaveChangesAsync();

            return Ok(link);
        }

        [HttpPut("Revoke")]
        public async Task<ActionResult> Revoke([FromBody] eventoLinkRevoke req)
        {
            if (req == null || req.id_evento_link <= 0)
                return BadRequest(new { error = "id_evento_link inválido." });

            var link = await _context.Set<ef_evento_links>()
                .FirstOrDefaultAsync(x => x.id_evento_link == req.id_evento_link);

            if (link == null) return NotFound(new { error = "Link no encontrado." });

            link.activo = false;

            await _context.SaveChangesAsync();
            return Ok(new { ok = true });
        }
    }
}
