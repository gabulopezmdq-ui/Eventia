using API.DataSchema;
using API.DataSchema.DTO.Programas;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;


namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas")]
    //[Authorize]
    [AllowAnonymous]
    public class programasInscriptosController : ControllerBase
    {
        private readonly DataContext _context;

        public programasInscriptosController(DataContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("{idEvento:long}/inscriptos")]
        public async Task<ActionResult<List<ProgramaInscriptosListItemDTO>>> GetInscriptos(
            long idEvento,
            [FromQuery] string? q = null,
            [FromQuery] string? estadoPago = null,
            [FromQuery] bool? soloAlertas = null)
        {
            var inscripcionesQuery = _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento && x.activo == true);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var query = q.Trim().ToUpper();
                inscripcionesQuery = inscripcionesQuery.Where(x =>
                    (x.responsable_nombre ?? "").ToUpper().Contains(query) ||
                    (x.responsable_apellido ?? "").ToUpper().Contains(query) ||
                    (x.responsable_email != null && x.responsable_email.ToUpper().Contains(query)) ||
                    (x.responsable_telefono != null && x.responsable_telefono.ToUpper().Contains(query))
                );
            }

            var inscripcionesData = await inscripcionesQuery
                .OrderBy(x => x.responsable_apellido)
                .ThenBy(x => x.responsable_nombre)
                .Select(insc => new
                {
                    Inscripcion = insc,
                    CantidadPeriodos = _context.Set<ef_programa_inscripcion_periodos>()
                        .Count(p => p.id_inscripcion == insc.id_inscripcion && p.activo == true),
                    CantidadServicios = _context.Set<ef_programa_inscripcion_servicios>()
                        .Count(s => s.id_inscripcion == insc.id_inscripcion && s.activo == true),
                    Pagos = _context.Set<ef_programa_inscripcion_pagos>()
                        .Where(p => p.id_inscripcion == insc.id_inscripcion && p.anulado == false)
                        .Select(p => p.importe)
                        .ToList(),
                    Ajustes = _context.Set<ef_programa_inscripcion_ajustes>()
                        .Where(a => a.id_inscripcion == insc.id_inscripcion && a.activo == true)
                        .Select(a => new { a.importe, a.tipo })
                        .ToList(),
                    Participantes = insc.id_rsvp_grupo != null
                        ? (from gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                           join inv in _context.Set<ef_invitados>().AsNoTracking() on gi.id_invitado equals inv.id_invitado
                           where gi.id_rsvp_grupo == insc.id_rsvp_grupo && gi.requiere_asistencia == true && inv.activo == true
                           orderby inv.apellido, inv.nombre
                           select (inv.nombre ?? "") + " " + (inv.apellido ?? ""))
                          .ToList()
                        : new List<string>(),
                    TieneRestricciones = insc.id_rsvp_grupo != null && _context.Set<ef_rsvp_integrante_restricciones>()
                        .Any(r => _context.Set<ef_rsvp_grupo_integrantes>()
                            .Any(gi => gi.id_rsvp_grupo == insc.id_rsvp_grupo && gi.id_rsvp_grupo_integrante == r.id_rsvp_grupo_integrante)),
                    TieneAlertasSalud = (insc.id_rsvp_grupo != null && _context.Set<ef_programa_inscripcion_salud_fichas>()
                        .Any(f => _context.Set<ef_rsvp_grupo_integrantes>()
                            .Any(gi => gi.id_rsvp_grupo == insc.id_rsvp_grupo && gi.id_rsvp_grupo_integrante == f.id_rsvp_grupo_integrante) &&
                            (f.tiene_problema_medico == true || f.tiene_alergias_no_alimentarias == true || !string.IsNullOrWhiteSpace(f.necesidad_especial))))
                        || _context.Set<ef_programa_inscripcion_salud_medicaciones>()
                        .Any(m => _context.Set<ef_programa_inscripcion_salud_fichas>()
                            .Any(f => f.id_salud_ficha == m.id_salud_ficha && f.id_inscripcion == insc.id_inscripcion && f.activo == true))
                })
                .ToListAsync();

            var result = new List<ProgramaInscriptosListItemDTO>();

            foreach (var data in inscripcionesData)
            {
                var insc = data.Inscripcion;
                
                decimal totalPagado = data.Pagos.Sum();
                decimal descuentos = data.Ajustes.Where(x => x.tipo == "DESCUENTO" || x.tipo == "BONIFICACION").Sum(x => x.importe);
                decimal recargos = data.Ajustes.Where(x => x.tipo == "RECARGO").Sum(x => x.importe);
                
                decimal totalAPagar = Math.Max(0, insc.total_general - descuentos + recargos);
                decimal saldo = Math.Max(0, totalAPagar - totalPagado);

                result.Add(new ProgramaInscriptosListItemDTO
                {
                    IdInscripcion = insc.id_inscripcion,
                    IdRsvpGrupo = insc.id_rsvp_grupo,
                    Responsable = ((insc.responsable_nombre ?? "") + " " + (insc.responsable_apellido ?? "")).Trim(),
                    Email = insc.responsable_email,
                    Telefono = insc.responsable_telefono,
                    Participantes = data.Participantes,
                    CantidadParticipantes = data.Participantes.Count,
                    CantidadPeriodos = data.CantidadPeriodos,
                    CantidadServicios = data.CantidadServicios,
                    TieneRestriccionesAlimentarias = data.TieneRestricciones,
                    TieneAlertasSalud = data.TieneAlertasSalud,
                    TotalOriginal = insc.total_general,
                    TotalPagado = totalPagado,
                    Saldo = saldo,
                    Moneda = insc.moneda,
                    EstadoPago = ResolverEstadoPago(totalAPagar, totalPagado),
                    EstadoInscripcion = insc.estado
                });
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

        [AllowAnonymous]
        [HttpGet("{idEvento:long}/inscriptos/resumen")]
        public async Task<ActionResult<ProgramaInscriptosResumenDTO>> GetInscriptosResumen(long idEvento)
        {
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
                .ToList();

            var idsGrupos = inscripciones
                .Where(x => x.id_rsvp_grupo != null)
                .Select(x => x.id_rsvp_grupo.Value)
                .Distinct()
                .ToList();

            var totalParticipantes = 0;
            if (idsGrupos.Any())
            {
                totalParticipantes = await _context.Set<ef_rsvp_grupo_integrantes>()
                    .AsNoTracking()
                    .CountAsync(x =>
                        idsGrupos.Contains(x.id_rsvp_grupo) &&
                        x.requiere_asistencia == true);
            }

            var pagos = await _context.Set<ef_programa_inscripcion_pagos>()
                .AsNoTracking()
                .Where(x =>
                    idsInscripciones.Contains(x.id_inscripcion) &&
                    x.anulado == false)
                .ToListAsync();

            var ajustes = await _context.Set<ef_programa_inscripcion_ajustes>()
                .AsNoTracking()
                .Where(x =>
                    idsInscripciones.Contains(x.id_inscripcion) &&
                    x.activo == true)
                .ToListAsync();

            var fichas = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x =>
                    idsInscripciones.Contains(x.id_inscripcion) &&
                    x.activo == true)
                .ToListAsync();

            var medicaciones = await (
                from m in _context.Set<ef_programa_inscripcion_salud_medicaciones>().AsNoTracking()
                join f in _context.Set<ef_programa_inscripcion_salud_fichas>().AsNoTracking()
                    on m.id_salud_ficha equals f.id_salud_ficha
                where idsInscripciones.Contains(f.id_inscripcion) && f.activo == true
                select new { f.id_inscripcion, m.id_medicacion }
            ).ToListAsync();

            int pendientes = 0;
            int parciales = 0;
            int pagados = 0;
            int sinCargo = 0;
            int conAlertas = 0;
            decimal totalDeuda = 0;

            foreach (var insc in inscripciones)
            {
                var ajustesInsc = ajustes
                    .Where(x => x.id_inscripcion == insc.id_inscripcion)
                    .ToList();

                var pagosInsc = pagos
                    .Where(x => x.id_inscripcion == insc.id_inscripcion)
                    .ToList();

                decimal descuentos = ajustesInsc
                    .Where(x => x.tipo == "DESCUENTO" || x.tipo == "BONIFICACION")
                    .Sum(x => x.importe);

                decimal recargos = ajustesInsc
                    .Where(x => x.tipo == "RECARGO")
                    .Sum(x => x.importe);

                decimal totalAPagar = Math.Max(0, insc.total_general - descuentos + recargos);
                decimal totalPagado = pagosInsc.Sum(x => x.importe);
                decimal saldo = Math.Max(0, totalAPagar - totalPagado);

                totalDeuda += saldo;

                string estadoPago = ResolverEstadoPagoInscriptos(totalAPagar, totalPagado);

                if (estadoPago == "SIN_CARGO")
                    sinCargo++;
                else if (estadoPago == "PENDIENTE")
                    pendientes++;
                else if (estadoPago == "PARCIAL")
                    parciales++;
                else if (estadoPago == "PAGADO")
                    pagados++;

                bool tieneFichaAlerta = fichas.Any(x =>
                    x.id_inscripcion == insc.id_inscripcion &&
                    (
                        (x.tiene_problema_medico == true) ||
                        (x.tiene_alergias_no_alimentarias == true) ||
                        (!string.IsNullOrWhiteSpace(x.necesidad_especial))
                    ));

                bool tieneMedicacion = medicaciones.Any(x =>
                    x.id_inscripcion == insc.id_inscripcion);

                if (tieneFichaAlerta || tieneMedicacion)
                    conAlertas++;
            }

            string moneda = inscripciones
                .Select(x => x.moneda)
                .FirstOrDefault(x => !string.IsNullOrWhiteSpace(x)) ?? "";

            return Ok(new ProgramaInscriptosResumenDTO
            {
                IdEvento = idEvento,
                Programa = (evento.saludo ?? evento.anfitriones_texto ?? ("Programa " + idEvento)).Trim(),
                Modulo = "Inscriptos",
                TotalFamilias = inscripciones.Count,
                TotalParticipantes = totalParticipantes,
                TotalDeuda = totalDeuda,
                Moneda = moneda,
                Pendientes = pendientes,
                Parciales = parciales,
                Pagados = pagados,
                SinCargo = sinCargo,
                ConAlertas = conAlertas
            });

        }

        private async Task<bool> ValidarAccesoEvento(long idEvento)
        {
            // 1. Identificar si es Staff o Usuario normal desde los claims
            bool isStaff = User.FindFirstValue("is_staff") == "true";
            string sub = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? "";

            if (isStaff)
            {
                // Caso Staff: Validar id_evento del token
                string idEventoTokenStr = User.FindFirstValue("id_evento");
                if (long.TryParse(idEventoTokenStr, out long idEventoToken) && idEventoToken == idEvento)
                    return true;

                // Caso Staff de cuenta (corporativo): Validar que el evento pertenezca a su cuenta
                string idCuentaTokenStr = User.FindFirstValue("id_cuenta");
                if (long.TryParse(idCuentaTokenStr, out long idCuentaToken))
                {
                    return await _context.Set<ef_eventos>()
                        .AnyAsync(e => e.id_evento == idEvento && e.id_cuenta == idCuentaToken);
                }

                return false;
            }
            else
            {
                // Caso Usuario normal: Validar vía ef_evento_usuarios o ef_cuenta_usuarios
                if (!long.TryParse(sub, out long idUsuario))
                    return false;

                // Membresía directa al evento
                bool esMiembroEvento = await _context.Set<ef_evento_usuarios>()
                    .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuario && x.activo == true);

                if (esMiembroEvento) return true;

                // Pertenencia a la cuenta propietaria
                var idCuentaEvento = await _context.Set<ef_eventos>()
                    .Where(x => x.id_evento == idEvento)
                    .Select(x => x.id_cuenta)
                    .FirstOrDefaultAsync();

                if (idCuentaEvento.HasValue)
                {
                    return await _context.Set<ef_cuenta_usuarios>()
                        .AnyAsync(x => x.id_cuenta == idCuentaEvento.Value && x.id_usuario == idUsuario && x.activo == true);
                }

                return false;
            }
        }

        private static string ResolverEstadoPagoInscriptos(decimal totalAPagar, decimal totalPagado)
        {
            if (totalAPagar <= 0)
                return "SIN_CARGO";

            if (totalPagado <= 0)
                return "PENDIENTE";

            if (totalPagado < totalAPagar)
                return "PARCIAL";

            return "PAGADO";
        }
    }
}