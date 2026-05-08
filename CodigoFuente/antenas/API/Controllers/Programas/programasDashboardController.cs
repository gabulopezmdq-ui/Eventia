using API.DataSchema;
using API.DataSchema.DTO.Programas;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas")]
    //[Authorize]
    [AllowAnonymous]
    public class programasDashboardController : ControllerBase
    {
        private readonly DataContext _context;

        public programasDashboardController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{idEvento:long}/dashboard-dia")]
        public async Task<ActionResult<ProgramaDashboardDiaDTO>> GetDashboardDia(
            long idEvento,
            [FromQuery] DateOnly fecha,
            [FromQuery] short idIdioma = 1)
        {
            long idUsuario = User.GetUserId();

            bool pertenece = User.IsStaff() || await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x =>
                    x.id_evento == idEvento &&
                    x.id_usuario == idUsuario &&
                    x.activo == true);

            if (!pertenece)
                return Forbid();

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                return NotFound("Programa inexistente.");

            if (evento.tipo_operacion != "PROGRAMA")
                return BadRequest("El evento indicado no es de tipo PROGRAMA.");

            var inscripciones = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.activo == true)
                .ToListAsync();

            var idsInscripciones = inscripciones
                .Select(x => x.id_inscripcion)
                .Distinct()
                .ToList();

            var idsGrupos = inscripciones
                .Select(x => x.id_rsvp_grupo)
                .Distinct()
                .ToList();

            var participantes = await (
                from gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                where idsGrupos.Contains(gi.id_rsvp_grupo)
                      && gi.requiere_asistencia == true
                      && inv.activo == true
                select new
                {
                    gi.id_rsvp_grupo_integrante,
                    gi.id_rsvp_grupo,
                    inv.id_invitado,
                    participante = ((inv.nombre ?? "") + " " + (inv.apellido ?? "")).Trim()
                }
            ).ToListAsync();

            var idsIntegrantes = participantes
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToList();

            var idsInvitados = participantes
                .Select(x => x.id_invitado)
                .Distinct()
                .ToList();

            var serviciosDia = await (
                from sd in _context.Set<ef_programa_inscripcion_servicio_dias>().AsNoTracking()
                join s in _context.Set<ef_programa_inscripcion_servicios>().AsNoTracking()
                    on sd.id_inscripcion_servicio equals s.id_inscripcion_servicio
                where idsInscripciones.Contains(s.id_inscripcion)
                      && sd.fecha == fecha
                      && sd.activo == true
                      && s.activo == true
                select new
                {
                    s.id_inscripcion,
                    s.id_rsvp_grupo_integrante,
                    s.codigo,
                    s.nombre
                }
            ).ToListAsync();

            var comedorItems = serviciosDia
                .Where(x => x.codigo == "COMEDOR")
                .ToList();

            var transporteItems = serviciosDia
                .Where(x => x.codigo == "TRANSPORTE")
                .ToList();

            var restriccionesRaw = await (
                from rr in _context.Set<ef_rsvp_integrante_restricciones>().AsNoTracking()
                join pr in _context.Set<ef_param_restricciones_alimentarias>().AsNoTracking()
                    on rr.id_restriccion_alim equals pr.id_restriccion_alim
                where idsIntegrantes.Contains(rr.id_rsvp_grupo_integrante)
                      && pr.activo == true
                select new
                {
                    rr.id_rsvp_grupo_integrante,
                    rr.id_restriccion_alim,
                    pr.codigo,
                    pr.requiere_alerta_visual,
                    pr.es_alergeno,
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

            var saludFichas = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x =>
                    idsInscripciones.Contains(x.id_inscripcion) &&
                    x.activo == true)
                .ToListAsync();

            var medicaciones = await (
                from m in _context.Set<ef_programa_inscripcion_salud_medicaciones>().AsNoTracking()
                join f in _context.Set<ef_programa_inscripcion_salud_fichas>().AsNoTracking()
                    on m.id_salud_ficha equals f.id_salud_ficha
                where idsInscripciones.Contains(f.id_inscripcion)
                      && f.activo == true
                select new
                {
                    m.id_medicacion,
                    m.id_salud_ficha,
                    f.id_inscripcion,
                    f.id_rsvp_grupo_integrante,
                    m.nombre_medicacion,
                    m.requiere_autorizacion
                }
            ).ToListAsync();

            DateTimeOffset fechaDesde = new DateTimeOffset(
                fecha.Year,
                fecha.Month,
                fecha.Day,
                0,
                0,
                0,
                TimeSpan.Zero);

            DateTimeOffset fechaHasta = fechaDesde.AddDays(1);

            var accionesSaludHoy = await _context.Set<ef_programa_salud_acciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    idsInvitados.Contains(x.id_participante) &&
                    x.activo == true &&
                    x.fecha_hora >= fechaDesde &&
                    x.fecha_hora < fechaHasta)
                .ToListAsync();

            var accionesConSeguimiento = await _context.Set<ef_programa_salud_acciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    idsInvitados.Contains(x.id_participante) &&
                    x.activo == true &&
                    x.requiere_seguimiento == true)
                .ToListAsync();

            var retirosHoy = await (
                from r in _context.Set<ef_retiros>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on r.id_invitado_nino equals inv.id_invitado
                where r.id_evento == idEvento
                      && r.fecha_operativa == fecha
                orderby r.fecha_retiro descending
                select new ProgramaDashboardRetiroItemDTO
                {
                    Participante = ((inv.nombre ?? "") + " " + (inv.apellido ?? "")).Trim(),
                    RetiradoPor = r.nombre_retirador,
                    FechaRetiro = r.fecha_retiro
                }
            ).ToListAsync();

            var participantesConRestriccion = restriccionesRaw
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToList();

            var participantesConRestriccionAlta = restriccionesRaw
                .Where(x => x.requiere_alerta_visual || x.es_alergeno)
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToList();

            var inscripcionesConAlertaSalud = saludFichas
                .Where(x =>
                    (x.tiene_problema_medico ?? false) ||
                    (x.tiene_alergias_no_alimentarias ?? false) ||
                    !string.IsNullOrWhiteSpace(x.necesidad_especial))
                .Select(x => x.id_inscripcion)
                .Distinct()
                .ToList();

            int totalAlertas = participantesConRestriccionAlta.Count
                + inscripcionesConAlertaSalud.Count
                + medicaciones
                    .Select(x => x.id_rsvp_grupo_integrante)
                    .Distinct()
                    .Count();

            var alertas = new List<ProgramaDashboardAlertaDTO>();

            foreach (var r in restriccionesRaw.Where(x => x.requiere_alerta_visual || x.es_alergeno))
            {
                var p = participantes.FirstOrDefault(x => x.id_rsvp_grupo_integrante == r.id_rsvp_grupo_integrante);

                alertas.Add(new ProgramaDashboardAlertaDTO
                {
                    Nivel = "ALTA",
                    Tipo = "RESTRICCION_ALIMENTARIA",
                    Mensaje = r.texto,
                    Participante = p?.participante,
                    IdInvitado = p?.id_invitado
                });
            }

            foreach (var ficha in saludFichas.Where(x =>
                (x.tiene_problema_medico ?? false) ||
                (x.tiene_alergias_no_alimentarias ?? false) ||
                !string.IsNullOrWhiteSpace(x.necesidad_especial)))
            {
                var insc = inscripciones.FirstOrDefault(x => x.id_inscripcion == ficha.id_inscripcion);
                var part = participantes.FirstOrDefault(x => x.id_rsvp_grupo == insc?.id_rsvp_grupo);

                var textos = new[]
                {
                    ficha.tiene_problema_medico == true ? ficha.problema_medico_detalle : null,
                    ficha.tiene_alergias_no_alimentarias == true ? ficha.alergias_no_alimentarias_detalle : null,
                    ficha.necesidad_especial
                }
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();

                alertas.Add(new ProgramaDashboardAlertaDTO
                {
                    Nivel = "ALTA",
                    Tipo = "SALUD",
                    Mensaje = textos.Any() ? string.Join(" | ", textos) : "Alerta de salud",
                    Participante = part?.participante,
                    IdInvitado = part?.id_invitado
                });
            }

            foreach (var accion in accionesConSeguimiento.Take(10))
            {
                var p = participantes.FirstOrDefault(x => x.id_invitado == accion.id_participante);

                alertas.Add(new ProgramaDashboardAlertaDTO
                {
                    Nivel = "MEDIA",
                    Tipo = "SEGUIMIENTO",
                    Mensaje = accion.descripcion,
                    Participante = p?.participante,
                    IdInvitado = p?.id_invitado
                });
            }

            var totalesPorRestriccion = restriccionesRaw
                .Where(r => comedorItems.Any(c => c.id_rsvp_grupo_integrante == r.id_rsvp_grupo_integrante))
                .GroupBy(x => new
                {
                    x.codigo,
                    x.texto,
                    alerta = x.requiere_alerta_visual || x.es_alergeno
                })
                .Select(g => new ProgramaDashboardTotalRestriccionDTO
                {
                    Codigo = g.Key.codigo,
                    Texto = g.Key.texto,
                    Cantidad = g.Count(),
                    AlertaVisual = g.Key.alerta
                })
                .OrderByDescending(x => x.AlertaVisual)
                .ThenByDescending(x => x.Cantidad)
                .ThenBy(x => x.Texto)
                .ToList();

            var transportePorServicio = serviciosDia
                .Where(x => x.codigo.Contains("TRANSPORTE"))
                .GroupBy(x => new { x.codigo, x.nombre })
                .Select(g => new ProgramaDashboardServicioCountDTO
                {
                    Codigo = g.Key.codigo,
                    Nombre = g.Key.nombre,
                    Cantidad = g.Count()
                })
                .OrderBy(x => x.Nombre)
                .ToList();

            var dto = new ProgramaDashboardDiaDTO
            {
                IdEvento = idEvento,
                Programa = evento.saludo ?? evento.anfitriones_texto ?? ("Programa " + idEvento),
                Fecha = fecha,

                Cards = new ProgramaDashboardDiaCardsDTO
                {
                    ParticipantesEsperados = participantes.Count,
                    Comedor = comedorItems.Count,
                    Transporte = transporteItems.Count,
                    Alertas = totalAlertas,
                    Seguimientos = accionesConSeguimiento.Count,
                    RetirosRegistrados = retirosHoy.Count
                },

                AlertasOperativas = alertas
                    .OrderBy(x => x.Nivel == "ALTA" ? 0 : 1)
                    .ThenBy(x => x.Participante)
                    .Take(20)
                    .ToList(),

                Cocina = new ProgramaDashboardCocinaDTO
                {
                    TotalComedor = comedorItems.Count,
                    SinRestricciones = comedorItems.Count(x =>
                        !participantesConRestriccion.Contains(x.id_rsvp_grupo_integrante)),
                    ConRestricciones = comedorItems.Count(x =>
                        participantesConRestriccion.Contains(x.id_rsvp_grupo_integrante)),
                    AlertasAltas = comedorItems.Count(x =>
                        participantesConRestriccionAlta.Contains(x.id_rsvp_grupo_integrante)),
                    TotalesPorRestriccion = totalesPorRestriccion
                },

                Transporte = new ProgramaDashboardTransporteDTO
                {
                    TotalTransporte = transporteItems.Count,
                    PorServicio = transportePorServicio
                },

                Salud = new ProgramaDashboardSaludDTO
                {
                    ParticipantesConAlerta = totalAlertas,
                    AccionesHoy = accionesSaludHoy.Count,
                    SeguimientosPendientes = accionesConSeguimiento.Count,
                    Medicaciones = medicaciones.Count
                },

                Retiros = new ProgramaDashboardRetirosDTO
                {
                    RetirosRegistrados = retirosHoy.Count,
                    UltimosRetiros = retirosHoy.Take(5).ToList()
                }
            };

            return Ok(dto);
        }
    }
}