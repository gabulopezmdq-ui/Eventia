using API.DataSchema;
using API.DataSchema.DTO.Programas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas")]
    //[Authorize]
    [AllowAnonymous]
    public class programasCocinaController : ControllerBase
    {
        private readonly DataContext _context;

        public programasCocinaController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{idEvento:long}/cocina/dia")]
        public async Task<ActionResult<ProgramaCocinaDiaDTO>> GetCocinaDia(
            long idEvento,
            [FromQuery] DateOnly fecha,
            [FromQuery] short idIdioma = 1,
            [FromQuery] string servicioCodigo = "COMEDOR",
            [FromQuery] bool soloAlertas = false)
        {
            servicioCodigo = string.IsNullOrWhiteSpace(servicioCodigo)
                ? "COMEDOR"
                : servicioCodigo.Trim().ToUpper();

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                return NotFound("Programa inexistente.");

            if (evento.tipo_operacion != "PROGRAMA")
                return BadRequest("El evento indicado no es de tipo PROGRAMA.");

            var baseItems = await (
                from sd in _context.Set<ef_programa_inscripcion_servicio_dias>().AsNoTracking()
                join s in _context.Set<ef_programa_inscripcion_servicios>().AsNoTracking()
                    on sd.id_inscripcion_servicio equals s.id_inscripcion_servicio
                join gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    on s.id_rsvp_grupo_integrante equals gi.id_rsvp_grupo_integrante
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                join insc in _context.Set<ef_programa_inscripciones>().AsNoTracking()
                    on s.id_inscripcion equals insc.id_inscripcion
                where insc.id_evento == idEvento
                      && insc.activo == true
                      && sd.activo == true
                      && s.activo == true
                      && sd.fecha == fecha
                      && s.codigo == servicioCodigo
                orderby inv.apellido, inv.nombre
                select new
                {
                    inv.id_invitado,
                    gi.id_rsvp_grupo_integrante,
                    participante = inv.nombre + " " + inv.apellido,
                    responsable = insc.responsable_nombre + " " + insc.responsable_apellido,
                    telefono_responsable = insc.responsable_telefono,
                    servicio = s.nombre
                }
            ).ToListAsync();

            var idsIntegrantes = baseItems
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToList();

            var restriccionesRaw = await (
                from rr in _context.Set<ef_rsvp_integrante_restricciones>().AsNoTracking()
                join pr in _context.Set<ef_param_restricciones_alimentarias>().AsNoTracking()
                    on rr.id_restriccion_alim equals pr.id_restriccion_alim
                where idsIntegrantes.Contains(rr.id_rsvp_grupo_integrante)
                select new
                {
                    rr.id_rsvp_grupo_integrante,
                    rr.id_restriccion_alim,
                    pr.codigo,
                    pr.categoria,
                    pr.requiere_alerta_visual,
                    pr.requiere_confirmacion_organizador,
                    pr.es_alergeno,
                    rr.observaciones,
                    rr.severidad,
                    texto = _context.Set<ef_param_traducciones>()
                        .Where(t =>
                            t.entidad == "RESTR_ALIM_NOMBRE" &&
                            t.id_item == rr.id_restriccion_alim &&
                            t.id_idioma == idIdioma &&
                            t.activo == true)
                        .Select(t => t.texto)
                        .FirstOrDefault() ?? pr.codigo
                }
            ).ToListAsync();

            var saludRaw = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante))
                .Select(x => new
                {
                    x.id_rsvp_grupo_integrante,
                    x.tiene_problema_medico,
                    x.problema_medico_detalle,
                    x.tiene_alergias_no_alimentarias,
                    x.alergias_no_alimentarias_detalle,
                    x.necesidad_especial,
                    x.observaciones_familia
                })
                .ToListAsync();

            var items = baseItems.Select(b =>
            {
                var restricciones = restriccionesRaw
                    .Where(r => r.id_rsvp_grupo_integrante == b.id_rsvp_grupo_integrante)
                    .Select(r => new ProgramaCocinaRestriccionDTO
                    {
                        IdRestriccionAlim = r.id_restriccion_alim,
                        Codigo = r.codigo,
                        Texto = r.texto,
                        Categoria = r.categoria,
                        RequiereAlertaVisual = r.requiere_alerta_visual,
                        RequiereConfirmacionOrganizador = r.requiere_confirmacion_organizador,
                        EsAlergeno = r.es_alergeno,
                        Observaciones = r.observaciones,
                        Severidad = r.severidad
                    })
                    .ToList();

                var salud = saludRaw
                    .FirstOrDefault(x => x.id_rsvp_grupo_integrante == b.id_rsvp_grupo_integrante);

                var alertaVisual = restricciones.Any(x => x.RequiereAlertaVisual || x.EsAlergeno);

                var nivelAlerta = alertaVisual
                    ? "ALTA"
                    : restricciones.Any()
                        ? "MEDIA"
                        : "NORMAL";

                var observacionesSalud = salud == null
                    ? null
                    : string.Join(" | ", new[]
                    {
                        salud.tiene_problema_medico == true ? salud.problema_medico_detalle : null,
                        salud.tiene_alergias_no_alimentarias == true ? salud.alergias_no_alimentarias_detalle : null,
                        salud.necesidad_especial,
                        salud.observaciones_familia
                    }.Where(x => !string.IsNullOrWhiteSpace(x)));

                return new ProgramaCocinaItemDTO
                {
                    IdInvitado = b.id_invitado,
                    IdRsvpGrupoIntegrante = b.id_rsvp_grupo_integrante,
                    Participante = b.participante,
                    Responsable = b.responsable,
                    TelefonoResponsable = b.telefono_responsable,
                    Servicio = b.servicio,
                    Restricciones = restricciones,
                    AlertaVisual = alertaVisual,
                    NivelAlerta = nivelAlerta,
                    ObservacionesSalud = observacionesSalud
                };
            }).ToList();

            var resumenItems = items.ToList();

            if (soloAlertas)
                items = items.Where(x => x.AlertaVisual).ToList();

            items = items
                .OrderByDescending(x => x.AlertaVisual)
                .ThenByDescending(x => x.Restricciones.Any())
                .ThenBy(x => x.Participante)
                .ToList();

            var totalesPorRestriccion = items
                .SelectMany(x => x.Restricciones)
                .GroupBy(x => new { x.Codigo, x.Texto, x.RequiereAlertaVisual })
                .Select(g => new ProgramaCocinaTotalRestriccionDTO
                {
                    Codigo = g.Key.Codigo,
                    Texto = g.Key.Texto,
                    Cantidad = g.Count(),
                    AlertaVisual = g.Key.RequiereAlertaVisual
                })
                .OrderByDescending(x => x.AlertaVisual)
                .ThenByDescending(x => x.Cantidad)
                .ThenBy(x => x.Texto)
                .ToList();

            var dto = new ProgramaCocinaDiaDTO
            {
                IdEvento = idEvento,
                Programa = evento.saludo ?? evento.anfitriones_texto ?? ("Programa " + idEvento),
                Fecha = fecha,
                ServicioCodigo = servicioCodigo,
                Items = items,
                TotalesPorRestriccion = totalesPorRestriccion,
                Resumen = new ProgramaCocinaResumenDTO
                {
                    TotalComedor = resumenItems.Count,
                    SinRestricciones = resumenItems.Count(x => !x.Restricciones.Any()),
                    ConRestricciones = resumenItems.Count(x => x.Restricciones.Any()),
                    AlertasAltas = resumenItems.Count(x => x.AlertaVisual)
                }
            };

            return Ok(dto);
        }

        [HttpGet("{idEvento:long}/cocina/participantes/{idInvitado:long}/detalle")]
        public async Task<ActionResult<ProgramaCocinaDetalleDTO>> GetCocinaDetalleParticipante(
    long idEvento,
    long idInvitado,
    [FromQuery] DateOnly fecha,
    [FromQuery] short idIdioma = 1,
    [FromQuery] string servicioCodigo = "COMEDOR")
        {
            servicioCodigo = string.IsNullOrWhiteSpace(servicioCodigo)
                ? "COMEDOR"
                : servicioCodigo.Trim().ToUpper();

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                return NotFound("Programa inexistente.");

            var baseData = await (
                from sd in _context.Set<ef_programa_inscripcion_servicio_dias>().AsNoTracking()
                join s in _context.Set<ef_programa_inscripcion_servicios>().AsNoTracking()
                    on sd.id_inscripcion_servicio equals s.id_inscripcion_servicio
                join gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    on s.id_rsvp_grupo_integrante equals gi.id_rsvp_grupo_integrante
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                join insc in _context.Set<ef_programa_inscripciones>().AsNoTracking()
                    on s.id_inscripcion equals insc.id_inscripcion
                where insc.id_evento == idEvento
                      && insc.activo == true
                      && sd.activo == true
                      && s.activo == true
                      && sd.fecha == fecha
                      && s.codigo == servicioCodigo
                      && inv.id_invitado == idInvitado
                select new
                {
                    inv.id_invitado,
                    gi.id_rsvp_grupo_integrante,
                    participante = inv.nombre + " " + inv.apellido,
                    responsable = insc.responsable_nombre + " " + insc.responsable_apellido,
                    telefono_responsable = insc.responsable_telefono,
                    email_responsable = insc.responsable_email,
                    servicio_codigo = s.codigo,
                    servicio = s.nombre
                }
            ).FirstOrDefaultAsync();

            if (baseData == null)
                return NotFound("No se encontró el participante para esa fecha/servicio.");

            var serviciosDelDia = await (
                from sd in _context.Set<ef_programa_inscripcion_servicio_dias>().AsNoTracking()
                join s in _context.Set<ef_programa_inscripcion_servicios>().AsNoTracking()
                    on sd.id_inscripcion_servicio equals s.id_inscripcion_servicio
                where s.id_rsvp_grupo_integrante == baseData.id_rsvp_grupo_integrante
                      && sd.fecha == fecha
                      && sd.activo == true
                      && s.activo == true
                select new ProgramaCocinaDetalleServicioDTO
                {
                    Codigo = s.codigo,
                    Nombre = s.nombre
                }
            ).Distinct().ToListAsync();

            var restricciones = await (
                from rr in _context.Set<ef_rsvp_integrante_restricciones>().AsNoTracking()
                join pr in _context.Set<ef_param_restricciones_alimentarias>().AsNoTracking()
                    on rr.id_restriccion_alim equals pr.id_restriccion_alim
                where rr.id_rsvp_grupo_integrante == baseData.id_rsvp_grupo_integrante
                select new ProgramaCocinaRestriccionDTO
                {
                    IdRestriccionAlim = rr.id_restriccion_alim,
                    Codigo = pr.codigo,
                    Texto = _context.Set<ef_param_traducciones>()
                        .Where(t =>
                            t.entidad == "RESTR_ALIM_NOMBRE" &&
                            t.id_item == rr.id_restriccion_alim &&
                            t.id_idioma == idIdioma &&
                            t.activo == true)
                        .Select(t => t.texto)
                        .FirstOrDefault() ?? pr.codigo,
                    Categoria = pr.categoria,
                    RequiereAlertaVisual = pr.requiere_alerta_visual,
                    RequiereConfirmacionOrganizador = pr.requiere_confirmacion_organizador,
                    EsAlergeno = pr.es_alergeno,
                    Observaciones = rr.observaciones,
                    Severidad = rr.severidad
                }
            ).ToListAsync();

            var salud = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x => x.id_rsvp_grupo_integrante == baseData.id_rsvp_grupo_integrante)
                .Select(x => new
                {
                    x.tiene_problema_medico,
                    x.problema_medico_detalle,
                    x.tiene_alergias_no_alimentarias,
                    x.alergias_no_alimentarias_detalle,
                    x.necesidad_especial,
                    x.observaciones_familia
                })
                .FirstOrDefaultAsync();

            bool alertaVisual = restricciones.Any(x => x.RequiereAlertaVisual || x.EsAlergeno);

            string nivelAlerta = alertaVisual
                ? "ALTA"
                : restricciones.Any()
                    ? "MEDIA"
                    : "NORMAL";

            string? observacionesSalud = salud == null
                ? null
                : string.Join(" | ", new[]
                {
            salud.tiene_problema_medico == true ? salud.problema_medico_detalle : null,
            salud.tiene_alergias_no_alimentarias == true ? salud.alergias_no_alimentarias_detalle : null,
            salud.necesidad_especial,
            salud.observaciones_familia
                }.Where(x => !string.IsNullOrWhiteSpace(x)));

            return Ok(new ProgramaCocinaDetalleDTO
            {
                IdEvento = idEvento,
                Programa = evento.saludo ?? evento.anfitriones_texto ?? ("Programa " + idEvento),
                Fecha = fecha,
                ServicioCodigo = servicioCodigo,
                Participante = new ProgramaCocinaDetalleParticipanteDTO
                {
                    IdInvitado = baseData.id_invitado,
                    IdRsvpGrupoIntegrante = baseData.id_rsvp_grupo_integrante,
                    NombreCompleto = baseData.participante
                },
                Responsable = new ProgramaCocinaDetalleResponsableDTO
                {
                    NombreCompleto = baseData.responsable,
                    Telefono = baseData.telefono_responsable,
                    Email = baseData.email_responsable
                },
                ServiciosDelDia = serviciosDelDia,
                Restricciones = restricciones,
                Salud = salud == null
                    ? null
                    : new ProgramaCocinaDetalleSaludDTO
                    {
                        ObservacionesSalud = observacionesSalud,
                        TieneProblemaMedico = salud.tiene_problema_medico ?? false,
                        ProblemaMedicoDetalle = salud.problema_medico_detalle,
                        TieneAlergiasNoAlimentarias = salud.tiene_alergias_no_alimentarias ?? false,
                        AlergiasNoAlimentariasDetalle = salud.alergias_no_alimentarias_detalle,
                        NecesidadEspecial = salud.necesidad_especial,
                        ObservacionesFamilia = salud.observaciones_familia
                    },
                AlertaVisual = alertaVisual,
                NivelAlerta = nivelAlerta
            });
        }


    }
}
