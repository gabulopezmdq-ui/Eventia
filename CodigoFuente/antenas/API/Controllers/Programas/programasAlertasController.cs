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
    public class programasAlertasController : ControllerBase
    {
        private readonly DataContext _context;

        public programasAlertasController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{idEvento:long}/alertas-operativas")]
        public async Task<ActionResult<ProgramaAlertasOperativasDTO>> GetAlertasOperativas(
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
                .Where(x => x.id_evento == idEvento && x.activo == true)
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

            var alertas = new List<ProgramaAlertaOperativaItemDTO>();

            // 1. Restricciones alimentarias críticas
            var restricciones = await (
                from rr in _context.Set<ef_rsvp_integrante_restricciones>().AsNoTracking()
                join pr in _context.Set<ef_param_restricciones_alimentarias>().AsNoTracking()
                    on rr.id_restriccion_alim equals pr.id_restriccion_alim
                where idsIntegrantes.Contains(rr.id_rsvp_grupo_integrante)
                      && pr.activo == true
                      && (pr.requiere_alerta_visual == true || pr.es_alergeno == true)
                select new
                {
                    rr.id_rsvp_grupo_integrante,
                    rr.id_restriccion_alim,
                    pr.codigo,
                    pr.es_alergeno,
                    pr.requiere_alerta_visual,
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

            foreach (var r in restricciones)
            {
                var p = participantes.FirstOrDefault(x =>
                    x.id_rsvp_grupo_integrante == r.id_rsvp_grupo_integrante);

                alertas.Add(new ProgramaAlertaOperativaItemDTO
                {
                    Nivel = "ALTA",
                    Categoria = "COCINA",
                    Titulo = "Restricción alimentaria crítica",
                    Mensaje = string.IsNullOrWhiteSpace(r.observaciones)
                        ? r.texto
                        : r.texto + " - " + r.observaciones,
                    IdInvitado = p?.id_invitado,
                    Participante = p?.participante,
                    AccionSugerida = "Revisar cocina del día",
                    EndpointSugerido = $"/programas/{idEvento}/cocina/dia?fecha={fecha:yyyy-MM-dd}&idIdioma={idIdioma}&servicioCodigo=COMEDOR"
                });
            }

            // 2. Fichas de salud con alerta
            var fichas = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x =>
                    idsInscripciones.Contains(x.id_inscripcion) &&
                    x.activo == true)
                .ToListAsync();

            foreach (var ficha in fichas.Where(x =>
                (x.tiene_problema_medico ?? false) ||
                (x.tiene_alergias_no_alimentarias ?? false) ||
                !string.IsNullOrWhiteSpace(x.necesidad_especial)))
            {
                var p = participantes.FirstOrDefault(x =>
                    x.id_rsvp_grupo_integrante == ficha.id_rsvp_grupo_integrante);

                var textos = new[]
                {
                    ficha.tiene_problema_medico == true ? ficha.problema_medico_detalle : null,
                    ficha.tiene_alergias_no_alimentarias == true ? ficha.alergias_no_alimentarias_detalle : null,
                    ficha.necesidad_especial
                }
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();

                alertas.Add(new ProgramaAlertaOperativaItemDTO
                {
                    Nivel = "ALTA",
                    Categoria = "SALUD",
                    Titulo = "Alerta de salud",
                    Mensaje = textos.Any() ? string.Join(" | ", textos) : "Participante con información médica relevante.",
                    IdInvitado = p?.id_invitado,
                    Participante = p?.participante,
                    IdInscripcion = ficha.id_inscripcion,
                    AccionSugerida = "Ver ficha de salud",
                    EndpointSugerido = p == null
                        ? null
                        : $"/programas/{idEvento}/salud/participantes/{p.id_invitado}/detalle"
                });
            }

            // 3. Medicaciones
            var medicaciones = await (
                from m in _context.Set<ef_programa_inscripcion_salud_medicaciones>().AsNoTracking()
                join f in _context.Set<ef_programa_inscripcion_salud_fichas>().AsNoTracking()
                    on m.id_salud_ficha equals f.id_salud_ficha
                where idsInscripciones.Contains(f.id_inscripcion)
                      && f.activo == true
                select new
                {
                    f.id_inscripcion,
                    f.id_rsvp_grupo_integrante,
                    m.nombre_medicacion,
                    m.requiere_autorizacion,
                    m.dosis,
                    m.frecuencia,
                    m.horario
                }
            ).ToListAsync();

            foreach (var m in medicaciones)
            {
                var p = participantes.FirstOrDefault(x =>
                    x.id_rsvp_grupo_integrante == m.id_rsvp_grupo_integrante);

                var detalle = string.Join(" | ", new[]
                {
                    m.nombre_medicacion,
                    m.dosis,
                    m.frecuencia,
                    m.horario
                }.Where(x => !string.IsNullOrWhiteSpace(x)));

                alertas.Add(new ProgramaAlertaOperativaItemDTO
                {
                    Nivel = m.requiere_autorizacion ? "ALTA" : "MEDIA",
                    Categoria = "SALUD",
                    Titulo = "Medicación informada",
                    Mensaje = detalle,
                    IdInvitado = p?.id_invitado,
                    Participante = p?.participante,
                    IdInscripcion = m.id_inscripcion,
                    AccionSugerida = "Ver ficha de salud",
                    EndpointSugerido = p == null
                        ? null
                        : $"/programas/{idEvento}/salud/participantes/{p.id_invitado}/detalle"
                });
            }

            // 4. Acciones de salud con seguimiento pendiente
            var accionesSeguimiento = await _context.Set<ef_programa_salud_acciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    idsInvitados.Contains(x.id_participante) &&
                    x.activo == true &&
                    x.requiere_seguimiento == true)
                .ToListAsync();

            foreach (var a in accionesSeguimiento)
            {
                var p = participantes.FirstOrDefault(x =>
                    x.id_invitado == a.id_participante);

                alertas.Add(new ProgramaAlertaOperativaItemDTO
                {
                    Nivel = "MEDIA",
                    Categoria = "SEGUIMIENTO",
                    Titulo = "Seguimiento pendiente",
                    Mensaje = a.descripcion,
                    IdInvitado = p?.id_invitado,
                    Participante = p?.participante,
                    AccionSugerida = "Revisar acciones de salud",
                    EndpointSugerido = p == null
                        ? null
                        : $"/programas/{idEvento}/salud/participantes/{p.id_invitado}/detalle"
                });
            }

            // 5. Autorizaciones médicas no aceptadas
            var autorizaciones = await _context.Set<ef_programa_inscripcion_autorizaciones>()
                .AsNoTracking()
                .Where(x =>
                    idsInscripciones.Contains(x.id_inscripcion) &&
                    x.activo == true)
                .ToListAsync();

            var codigosMedicos = new[]
            {
                "EMERGENCIA_MEDICA",
                "ATENCION_MEDICA",
                "MEDICACION",
                "DERIVACION",
                "TRASLADO_MEDICO"
            };

            foreach (var aut in autorizaciones.Where(x =>
                codigosMedicos.Contains(x.codigo) &&
                x.aceptada == false))
            {
                var p = aut.id_rsvp_grupo_integrante == null
                    ? null
                    : participantes.FirstOrDefault(x =>
                        x.id_rsvp_grupo_integrante == aut.id_rsvp_grupo_integrante.Value);

                alertas.Add(new ProgramaAlertaOperativaItemDTO
                {
                    Nivel = "ALTA",
                    Categoria = "AUTORIZACIONES",
                    Titulo = "Autorización médica no aceptada",
                    Mensaje = aut.codigo,
                    IdInvitado = p?.id_invitado,
                    Participante = p?.participante,
                    IdInscripcion = aut.id_inscripcion,
                    AccionSugerida = "Ver autorizaciones de inscripción",
                    EndpointSugerido = $"/programas/inscripciones/{aut.id_inscripcion}/autorizaciones?idIdioma={idIdioma}"
                });
            }

            var ordenadas = alertas
                .OrderBy(x => x.Nivel == "ALTA" ? 0 : x.Nivel == "MEDIA" ? 1 : 2)
                .ThenBy(x => x.Categoria)
                .ThenBy(x => x.Participante)
                .ToList();

            return Ok(new ProgramaAlertasOperativasDTO
            {
                IdEvento = idEvento,
                Programa = evento.saludo ?? evento.anfitriones_texto ?? ("Programa " + idEvento),
                Fecha = fecha,
                Alertas = ordenadas,
                Resumen = new ProgramaAlertasResumenDTO
                {
                    Total = ordenadas.Count,
                    Altas = ordenadas.Count(x => x.Nivel == "ALTA"),
                    Medias = ordenadas.Count(x => x.Nivel == "MEDIA"),
                    Bajas = ordenadas.Count(x => x.Nivel == "BAJA"),
                    Salud = ordenadas.Count(x => x.Categoria == "SALUD"),
                    Cocina = ordenadas.Count(x => x.Categoria == "COCINA"),
                    Autorizaciones = ordenadas.Count(x => x.Categoria == "AUTORIZACIONES"),
                    Seguimientos = ordenadas.Count(x => x.Categoria == "SEGUIMIENTO")
                }
            });
        }
    }
}
