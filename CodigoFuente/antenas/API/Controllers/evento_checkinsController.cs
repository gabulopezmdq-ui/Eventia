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
    public class evento_checkinsController : ControllerBase
    {
        private readonly DataContext _context;

        public evento_checkinsController(DataContext context)
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

            var result = await _context.Set<ef_evento_checkins>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .OrderByDescending(x => x.fecha)
                .Select(x => new
                {
                    x.id_checkin,
                    x.id_evento,
                    x.id_invitado,
                    x.id_acceso,
                    x.id_acceso_link,
                    x.tipo,
                    x.fecha,
                    x.id_usuario_operador,
                    x.observaciones
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ef_evento_checkins req)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == req.id_evento && x.id_usuario == idUsuario && x.activo);

            if (!pertenece)
                return Forbid();

            req.id_usuario_operador = idUsuario;
            req.fecha = DateTimeOffset.UtcNow;

            _context.Set<ef_evento_checkins>().Add(req);

            var ape = await _context.Set<ef_audiencia_persona_eventos>()
                .SingleOrDefaultAsync(x => x.id_evento == req.id_evento && x.id_invitado == req.id_invitado);

            if (ape != null && (req.tipo == "INGRESO" || req.tipo == "REINGRESO"))
            {
                ape.asistio = true;
                ape.fecha_asistencia = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { ok = true, id_checkin = req.id_checkin });
        }
    }
}