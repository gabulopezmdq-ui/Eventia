using API.DataSchema;
using API.DataSchema.DTO.AudienciaCRM;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace API.Controllers.Audiencia
{
    [ApiController]
    [Route("audiencia_crm")]
    [Authorize]
    public class audienciaCrmController : ControllerBase
    {
        private readonly DataContext _context;

        public audienciaCrmController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("listar")]
        public async Task<ActionResult<List<AudienciaCrmListItemDTO>>> Listar(
            [FromQuery] long idCuenta,
            [FromQuery] string? tipo,
            [FromQuery] string? q,
            [FromQuery] long? idEvento)
        {
            if (idCuenta <= 0)
                return BadRequest("idCuenta obligatorio.");

            tipo = string.IsNullOrWhiteSpace(tipo) ? "TODOS" : tipo.Trim().ToUpper();

            var personasQuery = _context.Set<ef_audiencias_personas>()
                .AsNoTracking()
                .Where(x => x.id_cuenta == idCuenta && x.activo == true);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var texto = q.Trim().ToLower();

                personasQuery = personasQuery.Where(x =>
                    x.nombre.ToLower().Contains(texto) ||
                    x.apellido.ToLower().Contains(texto) ||
                    (x.email != null && x.email.ToLower().Contains(texto)) ||
                    (x.celular != null && x.celular.ToLower().Contains(texto)));
            }

            var personas = await personasQuery
                .OrderBy(x => x.apellido)
                .ThenBy(x => x.nombre)
                .Take(500)
                .ToListAsync();

            var idsPersonas = personas.Select(x => x.id_audiencia_persona).ToList();

            var eventosPersona = await (
                from ape in _context.Set<ef_audiencia_persona_eventos>().AsNoTracking()
                join ev in _context.Set<ef_eventos>().AsNoTracking()
                    on ape.id_evento equals ev.id_evento
                where idsPersonas.Contains(ape.id_audiencia_persona)
                      && ev.id_cuenta == idCuenta
                      && (!idEvento.HasValue || ape.id_evento == idEvento.Value)
                select new
                {
                    ape.id_audiencia_persona,
                    ape.id_evento,
                    ape.fecha_registro,
                    ape.asistio,
                    ape.origen_registro,
                    ev.tipo_operacion,
                    ev.es_publico,
                    ev.anfitriones_texto,
                    ev.saludo
                }
            ).ToListAsync();

            var responsables = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_audiencia_persona_responsable.HasValue &&
                    idsPersonas.Contains(x.id_audiencia_persona_responsable.Value))
                .Select(x => new
                {
                    id_audiencia_persona = x.id_audiencia_persona_responsable!.Value,
                    x.id_evento
                })
                .ToListAsync();

            var participantesPrograma = await (
                from inv in _context.Set<ef_invitados>().AsNoTracking()
                join gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    on inv.id_invitado equals gi.id_invitado
                join ev in _context.Set<ef_eventos>().AsNoTracking()
                    on inv.id_evento equals ev.id_evento
                where inv.id_audiencia_persona.HasValue
                      && idsPersonas.Contains(inv.id_audiencia_persona.Value)
                      && ev.tipo_operacion == "PROGRAMA"
                      && gi.requiere_asistencia == true
                select new
                {
                    id_audiencia_persona = inv.id_audiencia_persona!.Value,
                    inv.id_evento,
                    inv.id_invitado,
                    gi.id_rsvp_grupo_integrante
                }
            ).ToListAsync();

            var staff = await _context.Set<ef_invitados>()
                .AsNoTracking()
                .Where(x =>
                    x.id_audiencia_persona.HasValue &&
                    idsPersonas.Contains(x.id_audiencia_persona.Value) &&
                    x.es_staff == true)
                .Select(x => x.id_audiencia_persona!.Value)
                .Distinct()
                .ToListAsync();

            var idsIntegrantes = participantesPrograma
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToList();

            var restricciones = await _context.Set<ef_rsvp_integrante_restricciones>()
                .AsNoTracking()
                .Where(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante))
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToListAsync();

            var salud = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante))
                .Select(x => x.id_rsvp_grupo_integrante)
                .Distinct()
                .ToListAsync();

            var comedor = await (
                from s in _context.Set<ef_programa_inscripcion_servicios>().AsNoTracking()
                where idsIntegrantes.Contains(s.id_rsvp_grupo_integrante)
                      && (s.codigo == "COMEDOR" || s.codigo == "MENJADOR")
                select s.id_rsvp_grupo_integrante
            ).Distinct().ToListAsync();

            var tags = await _context.Set<ef_audiencia_persona_tags>()
                .AsNoTracking()
                .Where(x => idsPersonas.Contains(x.id_audiencia_persona) && x.activo == true)
                .Select(x => new
                {
                    x.id_audiencia_persona,
                    tag = x.tag_tipo + ":" + x.tag_valor
                })
                .ToListAsync();

            var result = new List<AudienciaCrmListItemDTO>();

            foreach (var p in personas)
            {
                var evs = eventosPersona
                    .Where(x => x.id_audiencia_persona == p.id_audiencia_persona)
                    .ToList();

                var tipoPersona = ResolverTipoPersona(
                    p.id_audiencia_persona,
                    responsables.Any(x => x.id_audiencia_persona == p.id_audiencia_persona),
                    participantesPrograma.Any(x => x.id_audiencia_persona == p.id_audiencia_persona),
                    staff.Contains(p.id_audiencia_persona),
                    evs.Any(x => x.es_publico),
                    evs.Any(x => x.tipo_operacion == "EVENTO")
                );

                if (tipo != "TODOS" && tipoPersona != tipo)
                    continue;

                var alertas = new List<string>();

                var integrantesPersona = participantesPrograma
                    .Where(x => x.id_audiencia_persona == p.id_audiencia_persona)
                    .Select(x => x.id_rsvp_grupo_integrante)
                    .ToList();

                if (integrantesPersona.Any(x => restricciones.Contains(x)))
                    alertas.Add("RESTRICCION_ALIMENTARIA");

                if (integrantesPersona.Any(x => salud.Contains(x)))
                    alertas.Add("SALUD");

                if (integrantesPersona.Any(x => comedor.Contains(x)))
                    alertas.Add("COMEDOR");

                var ultimo = evs
                    .OrderByDescending(x => x.fecha_registro)
                    .FirstOrDefault();

                result.Add(new AudienciaCrmListItemDTO
                {
                    IdAudienciaPersona = p.id_audiencia_persona,
                    Nombre = p.nombre,
                    Apellido = p.apellido,
                    Email = p.email,
                    Celular = p.celular,
                    TipoPersona = tipoPersona,
                    TipoLabel = ResolverTipoLabel(tipoPersona),
                    Contexto = ultimo?.saludo ?? ultimo?.anfitriones_texto,
                    IdEventoContexto = ultimo?.id_evento,
                    UltimaParticipacion = evs.OrderByDescending(x => x.fecha_registro).Select(x => (DateTimeOffset?)x.fecha_registro).FirstOrDefault(),
                    EventosRegistrados = evs.Select(x => x.id_evento).Distinct().Count(),
                    EventosAsistidos = evs.Count(x => x.asistio),
                    Alertas = alertas,
                    Tags = tags.Where(x => x.id_audiencia_persona == p.id_audiencia_persona).Select(x => x.tag).ToList()
                });
            }

            return Ok(result);
        }

        [HttpGet("{idAudienciaPersona:long}/detalle")]
        public async Task<ActionResult<AudienciaCrmDetalleDTO>> Detalle(long idAudienciaPersona)
        {
            var persona = await _context.Set<ef_audiencias_personas>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_audiencia_persona == idAudienciaPersona);

            if (persona == null)
                return NotFound("Persona no encontrada.");

            var historial = await (
                from ape in _context.Set<ef_audiencia_persona_eventos>().AsNoTracking()
                join ev in _context.Set<ef_eventos>().AsNoTracking()
                    on ape.id_evento equals ev.id_evento
                where ape.id_audiencia_persona == idAudienciaPersona
                orderby ape.fecha_registro descending
                select new AudienciaCrmHistorialDTO
                {
                    IdEvento = ev.id_evento,
                    Evento = ev.saludo ?? ev.anfitriones_texto,
                    TipoOperacion = ev.tipo_operacion,
                    OrigenRegistro = ape.origen_registro,
                    FechaRegistro = ape.fecha_registro,
                    Asistio = ape.asistio,
                    BeneficioOtorgado = ape.beneficio_otorgado,
                    BeneficioCanjeado = ape.beneficio_canjeado
                }
            ).ToListAsync();

            var programa = await ResolverProgramaDetalleAsync(idAudienciaPersona);

            var tipoPersona = programa != null
                ? (programa.Responsable?.IdAudienciaPersona == idAudienciaPersona
                    ? "RESPONSABLE_PROGRAMA"
                    : "PARTICIPANTE_PROGRAMA")
                : "SIN_CLASIFICAR";

            var tags = await _context.Set<ef_audiencia_persona_tags>()
                .AsNoTracking()
                .Where(x => x.id_audiencia_persona == idAudienciaPersona && x.activo == true)
                .Select(x => x.tag_tipo + ":" + x.tag_valor)
                .ToListAsync();

            var alertas = new List<string>();

            if (programa?.Restricciones?.Any() == true)
                alertas.Add("RESTRICCION_ALIMENTARIA");

            if (programa?.Salud != null)
                alertas.Add("SALUD");

            if (programa?.Servicios?.Any(x => x.Codigo == "COMEDOR" || x.Codigo == "MENJADOR") == true)
                alertas.Add("COMEDOR");

            return Ok(new AudienciaCrmDetalleDTO
            {
                IdAudienciaPersona = persona.id_audiencia_persona,
                Nombre = persona.nombre,
                Apellido = persona.apellido,
                Email = persona.email,
                Celular = persona.celular,
                FechaNacimiento = persona.fecha_nacimiento,
                Edad = CalcularEdad(persona.fecha_nacimiento),
                TipoPersona = tipoPersona,
                TipoLabel = ResolverTipoLabel(tipoPersona),
                Alertas = alertas,
                Tags = tags,
                Historial = historial,
                Programa = programa
            });
        }

        [HttpGet("filtros")]
        public IActionResult Filtros()
        {
            return Ok(new
            {
                tipos = new[]
                {
                    new { codigo = "TODOS", texto = "Todos" },
                    new { codigo = "RESPONSABLE_PROGRAMA", texto = "Responsables / familias" },
                    new { codigo = "PARTICIPANTE_PROGRAMA", texto = "Participantes programas" },
                    new { codigo = "EVENTO_PUBLICO", texto = "Asistentes eventos públicos" },
                    new { codigo = "EVENTO_PRIVADO", texto = "Invitados eventos privados" },
                    new { codigo = "STAFF", texto = "Staff" },
                    new { codigo = "SIN_CLASIFICAR", texto = "Sin clasificar" }
                },
                alertas = new[]
                {
                    new { codigo = "COMEDOR", texto = "Comedor" },
                    new { codigo = "RESTRICCION_ALIMENTARIA", texto = "Restricción alimentaria" },
                    new { codigo = "SALUD", texto = "Salud" }
                }
            });
        }

        private async Task<AudienciaCrmProgramaDetalleDTO?> ResolverProgramaDetalleAsync(long idAudienciaPersona)
        {
            var responsable = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .Where(x => x.id_audiencia_persona_responsable == idAudienciaPersona)
                .OrderByDescending(x => x.fecha_alta)
                .FirstOrDefaultAsync();

            long? idGrupo = responsable?.id_rsvp_grupo;
            long? idInscripcion = responsable?.id_inscripcion;

            long? idIntegrantePersona = null;
            long? idInvitadoPersona = null;

            if (idGrupo == null)
            {
                var participante = await (
                    from inv in _context.Set<ef_invitados>().AsNoTracking()
                    join gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                        on inv.id_invitado equals gi.id_invitado
                    join ev in _context.Set<ef_eventos>().AsNoTracking()
                        on inv.id_evento equals ev.id_evento
                    where inv.id_audiencia_persona == idAudienciaPersona
                          && ev.tipo_operacion == "PROGRAMA"
                          && gi.requiere_asistencia == true
                    orderby inv.fecha_alta descending
                    select new
                    {
                        gi.id_rsvp_grupo,
                        gi.id_rsvp_grupo_integrante,
                        inv.id_invitado
                    }
                ).FirstOrDefaultAsync();

                if (participante == null)
                    return null;

                idGrupo = participante.id_rsvp_grupo;
                idIntegrantePersona = participante.id_rsvp_grupo_integrante;
                idInvitadoPersona = participante.id_invitado;

                var insc = await _context.Set<ef_programa_inscripciones>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.id_rsvp_grupo == idGrupo.Value);

                idInscripcion = insc?.id_inscripcion;
            }

            if (!idGrupo.HasValue)
                return null;

            var grupo = await _context.Set<ef_rsvp_grupos>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_rsvp_grupo == idGrupo.Value);

            if (grupo == null)
                return null;

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_evento == grupo.id_evento);

            var inscripcion = idInscripcion.HasValue
                ? await _context.Set<ef_programa_inscripciones>().AsNoTracking().FirstOrDefaultAsync(x => x.id_inscripcion == idInscripcion.Value)
                : await _context.Set<ef_programa_inscripciones>().AsNoTracking().FirstOrDefaultAsync(x => x.id_rsvp_grupo == grupo.id_rsvp_grupo);

            var integrantes = await (
                from gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                join ap in _context.Set<ef_audiencias_personas>().AsNoTracking()
                    on inv.id_audiencia_persona equals ap.id_audiencia_persona
                where gi.id_rsvp_grupo == grupo.id_rsvp_grupo
                orderby gi.orden
                select new
                {
                    gi.id_rsvp_grupo_integrante,
                    inv.id_invitado,
                    ap.id_audiencia_persona,
                    ap.nombre,
                    ap.apellido,
                    ap.fecha_nacimiento,
                    gi.requiere_asistencia
                }
            ).ToListAsync();

            var integranteActual = idIntegrantePersona;

            if (!integranteActual.HasValue)
            {
                integranteActual = integrantes
                    .Where(x => x.id_audiencia_persona == idAudienciaPersona && x.requiere_asistencia)
                    .Select(x => (long?)x.id_rsvp_grupo_integrante)
                    .FirstOrDefault();
            }

            var invitadoActual = idInvitadoPersona;

            if (!invitadoActual.HasValue)
            {
                invitadoActual = integrantes
                    .Where(x => x.id_audiencia_persona == idAudienciaPersona)
                    .Select(x => (long?)x.id_invitado)
                    .FirstOrDefault();
            }

            var dto = new AudienciaCrmProgramaDetalleDTO
            {
                IdEvento = grupo.id_evento,
                Evento = evento?.saludo ?? evento?.anfitriones_texto ?? "",
                IdInscripcion = inscripcion?.id_inscripcion,
                IdRsvpGrupo = grupo.id_rsvp_grupo,
                NombreGrupo = grupo.nombre_grupo,
                Responsable = inscripcion == null ? null : new AudienciaCrmResponsableDTO
                {
                    IdAudienciaPersona = inscripcion.id_audiencia_persona_responsable,
                    NombreCompleto = (inscripcion.responsable_nombre + " " + inscripcion.responsable_apellido).Trim(),
                    Email = inscripcion.responsable_email,
                    Telefono = inscripcion.responsable_telefono,
                    Relacion = inscripcion.responsable_relacion
                },
                ParticipantesGrupo = integrantes
                    .Where(x => x.requiere_asistencia)
                    .Select(x => new AudienciaCrmParticipanteGrupoDTO
                    {
                        IdAudienciaPersona = x.id_audiencia_persona,
                        IdInvitado = x.id_invitado,
                        IdRsvpGrupoIntegrante = x.id_rsvp_grupo_integrante,
                        NombreCompleto = (x.nombre + " " + x.apellido).Trim(),
                        Edad = CalcularEdad(x.fecha_nacimiento)
                    })
                    .ToList()
            };

            if (inscripcion != null && integranteActual.HasValue)
            {
                dto.Periodos = await _context.Set<ef_programa_inscripcion_periodos>()
                    .AsNoTracking()
                    .Where(x =>
                        x.id_inscripcion == inscripcion.id_inscripcion &&
                        x.id_rsvp_grupo_integrante == integranteActual.Value &&
                        x.activo == true)
                    .OrderBy(x => x.fecha_desde)
                    .Select(x => new AudienciaCrmPeriodoDTO
                    {
                        Nombre = x.nombre,
                        FechaDesde = x.fecha_desde,
                        FechaHasta = x.fecha_hasta,
                        PrecioBase = x.precio_base,
                        Moneda = x.moneda
                    })
                    .ToListAsync();

                var servicios = await _context.Set<ef_programa_inscripcion_servicios>()
                    .AsNoTracking()
                    .Where(x =>
                        x.id_inscripcion == inscripcion.id_inscripcion &&
                        x.id_rsvp_grupo_integrante == integranteActual.Value &&
                        x.activo == true)
                    .OrderBy(x => x.nombre)
                    .ToListAsync();

                var idsServicios = servicios.Select(x => x.id_inscripcion_servicio).ToList();

                var dias = await _context.Set<ef_programa_inscripcion_servicio_dias>()
                    .AsNoTracking()
                    .Where(x => idsServicios.Contains(x.id_inscripcion_servicio) && x.activo == true)
                    .ToListAsync();

                dto.Servicios = servicios.Select(s => new AudienciaCrmServicioDTO
                {
                    Nombre = s.nombre,
                    Codigo = s.codigo,
                    TipoCalculo = s.tipo_calculo,
                    Precio = s.precio,
                    Subtotal = s.subtotal,
                    Moneda = s.moneda,
                    Fechas = dias
                        .Where(d => d.id_inscripcion_servicio == s.id_inscripcion_servicio)
                        .OrderBy(d => d.fecha)
                        .Select(d => d.fecha)
                        .ToList()
                }).ToList();

                dto.Restricciones = await (
                    from r in _context.Set<ef_rsvp_integrante_restricciones>().AsNoTracking()
                    join p in _context.Set<ef_param_restricciones_alimentarias>().AsNoTracking()
                        on r.id_restriccion_alim equals p.id_restriccion_alim
                    where r.id_rsvp_grupo_integrante == integranteActual.Value
                    orderby p.orden
                    select new AudienciaCrmRestriccionDTO
                    {
                        IdRestriccionAlim = p.id_restriccion_alim,
                        Codigo = p.codigo,
                        Categoria = p.categoria,
                        IconKey = p.icon_key,
                        RequiereAlertaVisual = p.requiere_alerta_visual,
                        RequiereConfirmacionOrganizador = p.requiere_confirmacion_organizador,
                        EsAlergeno = p.es_alergeno,
                        Observaciones = r.observaciones,
                        Severidad = r.severidad
                    }
                ).ToListAsync();

                dto.Salud = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                    .AsNoTracking()
                    .Where(x =>
                        x.id_inscripcion == inscripcion.id_inscripcion &&
                        x.id_rsvp_grupo_integrante == integranteActual.Value &&
                        x.activo == true)
                    .Select(x => new AudienciaCrmSaludDTO
                    {
                        TieneProblemaMedico = x.tiene_problema_medico,
                        ProblemaMedicoDetalle = x.problema_medico_detalle,
                        TieneAlergiasNoAlimentarias = x.tiene_alergias_no_alimentarias,
                        AlergiasNoAlimentariasDetalle = x.alergias_no_alimentarias_detalle,
                        NecesidadEspecial = x.necesidad_especial,
                        CoberturaMedica = x.cobertura_medica,
                        ObservacionesFamilia = x.observaciones_familia,
                        AutorizaEmergenciaMedica = x.autoriza_emergencia_medica
                    })
                    .FirstOrDefaultAsync();

                if (invitadoActual.HasValue)
                {
                    dto.AutorizadosRetiro = await _context.Set<ef_autorizaciones>()
                        .AsNoTracking()
                        .Where(x =>
                            x.id_evento == grupo.id_evento &&
                            x.id_invitado_objetivo == invitadoActual.Value &&
                            x.activo == true &&
                            x.tipo == "R")
                        .OrderBy(x => x.nombre_autorizado)
                        .Select(x => new AudienciaCrmAutorizadoRetiroDTO
                        {
                            NombreAutorizado = x.nombre_autorizado,
                            TelefonoAutorizado = x.telefono_autorizado,
                            IdRelacionPersona = x.id_relacion_persona,
                            Observaciones = x.observaciones
                        })
                        .ToListAsync();
                }
            }

            return dto;
        }

        private static string ResolverTipoPersona(
            long idAudienciaPersona,
            bool esResponsablePrograma,
            bool esParticipantePrograma,
            bool esStaff,
            bool tieneEventoPublico,
            bool tieneEventoPrivado)
        {
            if (esStaff)
                return "STAFF";

            if (esResponsablePrograma)
                return "RESPONSABLE_PROGRAMA";

            if (esParticipantePrograma)
                return "PARTICIPANTE_PROGRAMA";

            if (tieneEventoPublico)
                return "EVENTO_PUBLICO";

            if (tieneEventoPrivado)
                return "EVENTO_PRIVADO";

            return "SIN_CLASIFICAR";
        }

        private static string ResolverTipoLabel(string tipo)
        {
            switch (tipo)
            {
                case "STAFF":
                    return "Staff";
                case "RESPONSABLE_PROGRAMA":
                    return "Responsable / familia";
                case "PARTICIPANTE_PROGRAMA":
                    return "Participante programa";
                case "EVENTO_PUBLICO":
                    return "Asistente evento público";
                case "EVENTO_PRIVADO":
                    return "Invitado evento privado";
                default:
                    return "Sin clasificar";
            }
        }

        private static int? CalcularEdad(DateTime? fechaNacimiento)
        {
            if (!fechaNacimiento.HasValue)
                return null;

            var hoy = DateTime.UtcNow.Date;
            var nac = fechaNacimiento.Value.Date;

            var edad = hoy.Year - nac.Year;
            if (nac > hoy.AddYears(-edad))
                edad--;

            return edad < 0 ? null : edad;
        }
    }
}

