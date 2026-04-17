using API.DataSchema;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class evento_beneficios_registroController : ControllerBase
    {
        private readonly DataContext _context;

        public evento_beneficios_registroController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("GetByEvento")]
        public async Task<ActionResult> GetByEvento([FromQuery] long idEvento)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo);

            if (!pertenece)
                return Forbid();

            var result = await _context.Set<ef_evento_beneficios_registro>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .OrderByDescending(x => x.fecha_otorgado)
                .Select(x => new
                {
                    x.id_beneficio_registro,
                    x.id_evento,
                    x.id_invitado,
                    x.id_acceso_link,
                    x.id_tipo_beneficio_registro,
                    x.titulo_snapshot,
                    x.descripcion_snapshot,
                    x.estado,
                    x.codigo_canje,
                    x.fecha_otorgado,
                    x.fecha_canje,
                    x.fecha_vencimiento,
                    x.id_usuario_valida,
                    x.observaciones
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpPost("Canjear")]
        public async Task<ActionResult> Canjear([FromQuery] long idBeneficioRegistro, [FromQuery] string? observaciones = null)
        {
            long idUsuario = User.GetUserId();

            var item = await (
                from b in _context.Set<ef_evento_beneficios_registro>()
                join eu in _context.Set<ef_evento_usuarios>() on b.id_evento equals eu.id_evento
                where b.id_beneficio_registro == idBeneficioRegistro
                    && eu.id_usuario == idUsuario
                    && eu.activo
                select b
            ).SingleOrDefaultAsync();

            if (item == null)
                return NotFound("Beneficio inexistente.");

            item.estado = "C";
            item.fecha_canje = DateTimeOffset.UtcNow;
            item.id_usuario_valida = idUsuario;
            item.observaciones = observaciones;

            var ape = await _context.Set<ef_audiencia_persona_eventos>()
                .SingleOrDefaultAsync(x => x.id_evento == item.id_evento && x.id_invitado == item.id_invitado);

            if (ape != null)
                ape.beneficio_canjeado = true;

            await _context.SaveChangesAsync();

            return Ok(new { ok = true });
        }
    }
}