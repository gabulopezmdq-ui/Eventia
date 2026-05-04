using API.DataSchema;
using API.DataSchema.DTO.Programas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;


namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas")]
    [Authorize]
    public class programasInscriptosController : ControllerBase
    {
        private readonly DataContext _context;

        public programasInscriptosController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{idEvento:long}/inscriptos")]
        public async Task<ActionResult<List<ProgramaInscriptosListItemDTO>>> GetInscriptos(
            long idEvento,
            [FromQuery] string? q = null,
            [FromQuery] string? estadoPago = null,
            [FromQuery] bool? soloAlertas = null)
        {
            var inscripciones = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento && x.activo == true)
                .OrderBy(x => x.responsable_apellido)
                .ThenBy(x => x.responsable_nombre)
                .ToListAsync();

            var result = new List<ProgramaInscriptosListItemDTO>();

            foreach (var insc in inscripciones)
            {
                var participantes = await (
                    from gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    join inv in _context.Set<ef_invitados>().AsNoTracking()
                        on gi.id_invitado equals inv.id_invitado
                    where gi.id_rsvp_grupo == insc.id_rsvp_grupo
                          && gi.requiere_asistencia == true
                          && inv.activo == true
                    orderby inv.apellido, inv.nombre
                    select new
                    {
                        gi.id_rsvp_grupo_integrante,
                        inv.id_invitado,
                        nombre = inv.nombre + " " + inv.apellido
                    }
                ).ToListAsync();

                var idsIntegrantes = participantes
                    .Select(x => x.id_rsvp_grupo_integrante)
                    .ToList();

                var cantidadPeriodos = await _context.Set<ef_programa_inscripcion_periodos>()
                    .AsNoTracking()
                    .CountAsync(x => x.id_inscripcion == insc.id_inscripcion && x.activo == true);

                var cantidadServicios = await _context.Set<ef_programa_inscripcion_servicios>()
                    .AsNoTracking()
                    .CountAsync(x => x.id_inscripcion == insc.id_inscripcion && x.activo == true);

                var tieneRestricciones = await _context.Set<ef_rsvp_integrante_restricciones>()
                    .AsNoTracking()
                    .AnyAsync(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante));

                var tieneAlertasSalud = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                    .AsNoTracking()
                    .AnyAsync(x =>
                        idsIntegrantes.Contains(x.id_rsvp_grupo_integrante) &&
                        (
                            x.tiene_problema_medico == true ||
                            x.tiene_alergias_no_alimentarias == true ||
                            !string.IsNullOrWhiteSpace(x.necesidad_especial)
                        ));

                var ajustes = await _context.Set<ef_programa_inscripcion_ajustes>()
                    .AsNoTracking()
                    .Where(x => x.id_inscripcion == insc.id_inscripcion && x.activo == true)
                    .ToListAsync();

                var pagos = await _context.Set<ef_programa_inscripcion_pagos>()
                    .AsNoTracking()
                    .Where(x => x.id_inscripcion == insc.id_inscripcion && x.anulado == false)
                    .ToListAsync();

                var descuentos = ajustes
                    .Where(x => x.tipo == "DESCUENTO" || x.tipo == "BONIFICACION")
                    .Sum(x => x.importe);

                var recargos = ajustes
                    .Where(x => x.tipo == "RECARGO")
                    .Sum(x => x.importe);

                var totalAPagar = insc.total_general - descuentos + recargos;

                if (totalAPagar < 0)
                    totalAPagar = 0;

                var totalPagado = pagos.Sum(x => x.importe);
                var saldo = totalAPagar - totalPagado;

                if (saldo < 0)
                    saldo = 0;

                var item = new ProgramaInscriptosListItemDTO
                {
                    IdInscripcion = insc.id_inscripcion,
                    IdRsvpGrupo = insc.id_rsvp_grupo,
                    Responsable = (insc.responsable_nombre + " " + insc.responsable_apellido).Trim(),
                    Email = insc.responsable_email,
                    Telefono = insc.responsable_telefono,
                    Participantes = participantes.Select(x => x.nombre).ToList(),
                    CantidadParticipantes = participantes.Count,
                    CantidadPeriodos = cantidadPeriodos,
                    CantidadServicios = cantidadServicios,
                    TieneRestriccionesAlimentarias = tieneRestricciones,
                    TieneAlertasSalud = tieneAlertasSalud,
                    TotalOriginal = insc.total_general,
                    TotalPagado = totalPagado,
                    Saldo = saldo,
                    Moneda = insc.moneda,
                    EstadoPago = ResolverEstadoPago(totalAPagar, totalPagado),
                    EstadoInscripcion = insc.estado
                };

                result.Add(item);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var query = q.Trim().ToUpper();

                result = result
                    .Where(x =>
                        x.Responsable.ToUpper().Contains(query) ||
                        (x.Email ?? "").ToUpper().Contains(query) ||
                        (x.Telefono ?? "").ToUpper().Contains(query) ||
                        x.Participantes.Any(p => p.ToUpper().Contains(query)))
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(estadoPago))
            {
                var ep = estadoPago.Trim().ToUpper();

                result = result
                    .Where(x => x.EstadoPago == ep)
                    .ToList();
            }

            if (soloAlertas == true)
            {
                result = result
                    .Where(x => x.TieneAlertasSalud || x.TieneRestriccionesAlimentarias)
                    .ToList();
            }

            result = result
                .OrderByDescending(x => x.TieneAlertasSalud)
                .ThenByDescending(x => x.TieneRestriccionesAlimentarias)
                .ThenBy(x => x.Responsable)
                .ToList();

            return Ok(result);
        }

        private static string ResolverEstadoPago(decimal totalAPagar, decimal totalPagado)
        {
            if (totalAPagar <= 0)
                return "SIN_CARGO";

            if (totalPagado <= 0)
                return "PENDIENTE";

            if (totalPagado < totalAPagar)
                return "PARCIAL";

            return "PAGADO";
        }

        [HttpGet("inscripciones/{idInscripcion:long}/detalle-operativo")]
        public async Task<ActionResult<ProgramaInscripcionDetalleOperativoDTO>> GetDetalleOperativo(
    long idInscripcion,
    [FromQuery] short idIdioma = 1)
        {
            var insc = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_inscripcion == idInscripcion && x.activo == true);

            if (insc == null)
                return NotFound("Inscripción no encontrada.");

            var participantesBase = await (
                from gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                where gi.id_rsvp_grupo == insc.id_rsvp_grupo
                      && gi.requiere_asistencia == true
                      && inv.activo == true
                orderby inv.apellido, inv.nombre
                select new
                {
                    gi.id_rsvp_grupo_integrante,
                    inv.id_invitado,
                    nombre_completo = inv.nombre + " " + inv.apellido,
                    gi.edad_anios,
                    gi.alimentacion_detalle
                }
            ).ToListAsync();

            var idsIntegrantes = participantesBase
                .Select(x => x.id_rsvp_grupo_integrante)
                .ToList();

            var idsInvitados = participantesBase
                .Select(x => x.id_invitado)
                .ToList();

            var periodos = await _context.Set<ef_programa_inscripcion_periodos>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion && x.activo == true)
                .ToListAsync();

            var servicios = await _context.Set<ef_programa_inscripcion_servicios>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion && x.activo == true)
                .ToListAsync();

            var idsServicios = servicios
                .Select(x => x.id_inscripcion_servicio)
                .ToList();

            var diasPorServicio = await _context.Set<ef_programa_inscripcion_servicio_dias>()
                .AsNoTracking()
                .Where(x => idsServicios.Contains(x.id_inscripcion_servicio) && x.activo == true)
                .GroupBy(x => x.id_inscripcion_servicio)
                .Select(g => new
                {
                    IdInscripcionServicio = g.Key,
                    CantidadDias = g.Count()
                })
                .ToListAsync();

            var restricciones = await (
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

            var salud = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante))
                .ToListAsync();

            var autorizados = await _context.Set<ef_autorizaciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == insc.id_evento &&
                    x.activo == true &&
                    x.tipo == "R" &&
                    idsInvitados.Contains(x.id_invitado_objetivo))
                .ToListAsync();

            var ajustes = await _context.Set<ef_programa_inscripcion_ajustes>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion && x.activo == true)
                .ToListAsync();

            var pagos = await _context.Set<ef_programa_inscripcion_pagos>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion && x.anulado == false)
                .ToListAsync();

            var descuentos = ajustes
                .Where(x => x.tipo == "DESCUENTO" || x.tipo == "BONIFICACION")
                .Sum(x => x.importe);

            var recargos = ajustes
                .Where(x => x.tipo == "RECARGO")
                .Sum(x => x.importe);

            var totalAPagar = insc.total_general - descuentos + recargos;

            if (totalAPagar < 0)
                totalAPagar = 0;

            var totalPagado = pagos.Sum(x => x.importe);
            var saldo = totalAPagar - totalPagado;

            if (saldo < 0)
                saldo = 0;

            var participantesDto = participantesBase.Select(p =>
            {
                var serviciosParticipante = servicios
                    .Where(s => s.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                    .Select(s =>
                    {
                        var dias = diasPorServicio
                            .FirstOrDefault(d => d.IdInscripcionServicio == s.id_inscripcion_servicio)
                            ?.CantidadDias ?? 0;

                        var cantidadCalculada =
                            s.tipo_calculo == "POR_DIA"
                                ? dias
                                : (s.cantidad ?? 1);

                        return new ProgramaInscriptoServicioDTO
                        {
                            IdProgramaServicio = s.id_programa_servicio,
                            Codigo = s.codigo,
                            Nombre = s.nombre,
                            TipoCalculo = s.tipo_calculo,
                            Precio = s.precio,
                            Subtotal = s.subtotal,
                            Moneda = s.moneda,
                            CantidadCalculada = cantidadCalculada
                        };
                    })
                    .ToList();

                var saludParticipante = salud
                    .FirstOrDefault(x => x.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante);

                return new ProgramaInscriptoParticipanteDetalleDTO
                {
                    IdInvitado = p.id_invitado,
                    IdRsvpGrupoIntegrante = p.id_rsvp_grupo_integrante,
                    NombreCompleto = p.nombre_completo,
                    Observaciones = p.alimentacion_detalle,

                    Periodos = periodos
                        .Where(x => x.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                        .Select(x => new ProgramaInscriptoPeriodoDTO
                        {
                            IdProgramaPeriodo = x.id_programa_periodo,
                            Nombre = x.nombre,
                            FechaDesde = x.fecha_desde,
                            FechaHasta = x.fecha_hasta,
                            PrecioBase = x.precio_base,
                            Moneda = x.moneda
                        })
                        .ToList(),

                    Servicios = serviciosParticipante,

                    RestriccionesAlimentarias = restricciones
                        .Where(x => x.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                        .Select(x => new ProgramaInscriptoRestriccionDTO
                        {
                            IdRestriccionAlim = x.id_restriccion_alim,
                            Codigo = x.codigo,
                            Texto = x.texto,
                            Categoria = x.categoria,
                            RequiereAlertaVisual = x.requiere_alerta_visual,
                            EsAlergeno = x.es_alergeno,
                            Observaciones = x.observaciones,
                            Severidad = x.severidad
                        })
                        .ToList(),

                    Salud = saludParticipante == null
                        ? null
                        : new ProgramaInscriptoSaludDTO
                        {
                            TieneProblemaMedico = saludParticipante.tiene_problema_medico,
                            ProblemaMedicoDetalle = saludParticipante.problema_medico_detalle,
                            TieneAlergiasNoAlimentarias = saludParticipante.tiene_alergias_no_alimentarias,
                            AlergiasNoAlimentariasDetalle = saludParticipante.alergias_no_alimentarias_detalle,
                            NecesidadEspecial = saludParticipante.necesidad_especial,
                            CoberturaMedica = saludParticipante.cobertura_medica,
                            ObservacionesFamilia = saludParticipante.observaciones_familia,
                            AutorizaEmergenciaMedica = saludParticipante.autoriza_emergencia_medica
                        },

                    AutorizadosRetiro = autorizados
                        .Where(a => a.id_invitado_objetivo == p.id_invitado)
                        .Select(a => new ProgramaInscriptoAutorizadoRetiroDTO
                        {
                            IdAutorizacion = a.id_autorizacion,
                            NombreAutorizado = a.nombre_autorizado,
                            TelefonoAutorizado = a.telefono_autorizado,
                            Relacion = a.relacion,
                            Observaciones = a.observaciones,
                            QrToken = a.qr_token
                        })
                        .ToList()
                };
            }).ToList();

            return Ok(new ProgramaInscripcionDetalleOperativoDTO
            {
                IdInscripcion = insc.id_inscripcion,
                IdRsvpGrupo = insc.id_rsvp_grupo,
                Responsable = (insc.responsable_nombre + " " + insc.responsable_apellido).Trim(),
                Email = insc.responsable_email,
                Telefono = insc.responsable_telefono,
                EstadoInscripcion = insc.estado,
                EstadoPago = ResolverEstadoPago(totalAPagar, totalPagado),
                TotalOriginal = insc.total_general,
                TotalPagado = totalPagado,
                Saldo = saldo,
                Moneda = insc.moneda,
                Participantes = participantesDto
            });
        }
    }
}