using API.DataSchema;
using API.DataSchema.DTO.Programas;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas")]
    //[Authorize]
    [AllowAnonymous]
    public class programasInscripcionAutorizacionesController : ControllerBase
    {
        private readonly DataContext _context;

        public programasInscripcionAutorizacionesController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("inscripciones/{idInscripcion:long}/autorizaciones")]
        public async Task<ActionResult<ProgramaInscripcionAutorizacionesResponseDTO>> GetAutorizacionesInscripcion(
            long idInscripcion,
            [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();

            var inscripcion = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_inscripcion == idInscripcion && x.activo == true);

            if (inscripcion == null)
                return NotFound("Inscripción inexistente.");

            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x =>
                    x.id_evento == inscripcion.id_evento &&
                    x.id_usuario == idUsuario &&
                    x.activo == true);

            if (!pertenece)
                return Forbid();

            var autorizaciones = await (
                from a in _context.Set<ef_programa_inscripcion_autorizaciones>().AsNoTracking()
                join cfg in _context.Set<ef_programa_autorizaciones_config>().AsNoTracking()
                    on a.id_programa_autorizacion_config equals cfg.id_programa_autorizacion_config
                join gi0 in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    on a.id_rsvp_grupo_integrante equals gi0.id_rsvp_grupo_integrante into giJoin
                from gi in giJoin.DefaultIfEmpty()
                join inv0 in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv0.id_invitado into invJoin
                from inv in invJoin.DefaultIfEmpty()
                where a.id_inscripcion == idInscripcion
                      && a.activo == true
                orderby cfg.orden, a.codigo
                select new
                {
                    a.id_inscripcion_autorizacion,
                    a.id_inscripcion,
                    a.id_rsvp_grupo_integrante,
                    participante = inv == null ? null : ((inv.nombre ?? "") + " " + (inv.apellido ?? "")),
                    a.id_programa_autorizacion_config,
                    a.codigo,
                    titulo = _context.Set<ef_programa_autorizacion_config_traducciones>()
                        .Where(t =>
                            t.id_programa_autorizacion_config == a.id_programa_autorizacion_config &&
                            t.id_idioma == idIdioma &&
                            t.activo == true)
                        .Select(t => t.titulo)
                        .FirstOrDefault()
                        ?? cfg.titulo_override
                        ?? cfg.codigo,
                    a.texto_aceptado,
                    a.aceptada,
                    a.fecha_aceptacion,
                    a.nombre_firmante
                }
            ).ToListAsync();

            var items = autorizaciones.Select(a => new ProgramaInscripcionAutorizacionAceptadaDTO
            {
                IdInscripcionAutorizacion = a.id_inscripcion_autorizacion,
                IdInscripcion = a.id_inscripcion,
                IdRsvpGrupoIntegrante = a.id_rsvp_grupo_integrante,
                Participante = string.IsNullOrWhiteSpace(a.participante) ? null : a.participante.Trim(),
                IdProgramaAutorizacionConfig = a.id_programa_autorizacion_config,
                Codigo = a.codigo,
                Titulo = a.titulo,
                TextoAceptado = a.texto_aceptado,
                Aceptada = a.aceptada,
                FechaAceptacion = a.fecha_aceptacion,
                NombreFirmante = a.nombre_firmante
            }).ToList();

            return Ok(new ProgramaInscripcionAutorizacionesResponseDTO
            {
                IdInscripcion = inscripcion.id_inscripcion,
                Responsable = ((inscripcion.responsable_nombre ?? "") + " " + (inscripcion.responsable_apellido ?? "")).Trim(),
                Email = inscripcion.responsable_email,
                Telefono = inscripcion.responsable_telefono,
                AutorizacionesGrupo = items
                    .Where(x => x.IdRsvpGrupoIntegrante == null)
                    .ToList(),
                AutorizacionesParticipantes = items
                    .Where(x => x.IdRsvpGrupoIntegrante != null)
                    .ToList()
            });
        }
    }
}