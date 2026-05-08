using API.DataSchema;
using API.DataSchema.DTO.Programas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers.Programas
{
    [ApiController]
    [Route("programas")]
    //[Authorize]
    [AllowAnonymous]
    public class programasInscripcionPagosController : ControllerBase
    {
        private readonly DataContext _context;

        public programasInscripcionPagosController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("tipos-ajuste")]
        public async Task<IActionResult> GetTiposAjuste([FromQuery] short idIdioma)
        {
            var result = await (
                from t in _context.Set<ef_param_programa_tipos_ajuste>().AsNoTracking()
                where t.activo == true
                orderby t.orden
                select new
                {
                    id = t.id_tipo_ajuste,
                    codigo = t.codigo,
                    texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "PROGRAMA_TIPO_AJUSTE" &&
                            tr.id_item == t.id_tipo_ajuste &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? t.codigo,
                    orden = t.orden
                }
            ).ToListAsync();

            return Ok(result);
        }

        [HttpGet("{idEvento:long}/inscripciones/pagos")]
        public async Task<ActionResult<List<ProgramaInscripcionPagoListItemDTO>>> GetPagosInscripciones(long idEvento)
        {
            var inscripciones = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento && x.activo == true)
                .OrderBy(x => x.responsable_apellido)
                .ThenBy(x => x.responsable_nombre)
                .ToListAsync();

            var result = new List<ProgramaInscripcionPagoListItemDTO>();

            foreach (var insc in inscripciones)
            {
                result.Add(await ArmarResumenPagoAsync(insc.id_inscripcion));
            }

            return Ok(result);
        }

        [HttpGet("inscripciones/{idInscripcion:long}/estado-pago")]
        public async Task<ActionResult<ProgramaInscripcionEstadoPagoDTO>> GetEstadoPago(long idInscripcion, [FromQuery] short idIdioma = 1)
        {
            var insc = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_inscripcion == idInscripcion && x.activo == true);

            if (insc == null)
                return NotFound("Inscripción no encontrada.");

            var resumen = await ArmarResumenPagoAsync(idInscripcion);

            var dto = new ProgramaInscripcionEstadoPagoDTO
            {
                IdInscripcion = resumen.IdInscripcion,
                IdRsvpGrupo = resumen.IdRsvpGrupo,
                Responsable = resumen.Responsable,
                Email = resumen.Email,
                Telefono = resumen.Telefono,
                Participantes = resumen.Participantes,
                TotalOriginal = resumen.TotalOriginal,
                TotalDescuentos = resumen.TotalDescuentos,
                TotalRecargos = resumen.TotalRecargos,
                TotalAPagar = resumen.TotalAPagar,
                TotalPagado = resumen.TotalPagado,
                Saldo = resumen.Saldo,
                Moneda = resumen.Moneda,
                EstadoPago = resumen.EstadoPago,
                Periodos = await GetDetallePeriodosAsync(idInscripcion),
                Servicios = await GetDetalleServiciosAsync(idInscripcion),
                Ajustes = await GetAjustesAsync(idInscripcion, idIdioma),
                Pagos = await GetPagosAsync(idInscripcion)
            };

            return Ok(dto);
        }

        [HttpPost("inscripciones/{idInscripcion:long}/ajustes")]
        public async Task<ActionResult<ProgramaInscripcionOperacionPagoResponse>> CrearAjuste(
            long idInscripcion,
            [FromBody] ProgramaInscripcionCrearAjusteRequest req)
        {
            var insc = await _context.Set<ef_programa_inscripciones>()
                .SingleOrDefaultAsync(x => x.id_inscripcion == idInscripcion && x.activo == true);

            if (insc == null)
                return NotFound("Inscripción no encontrada.");

            var tipo = (req.Tipo ?? "").Trim().ToUpper();

            var tiposValidos = new List<string> { "DESCUENTO", "RECARGO", "BONIFICACION" };

            if (!tiposValidos.Contains(tipo))
                return BadRequest("Tipo inválido. Use DESCUENTO, RECARGO o BONIFICACION.");

            if (req.IdTipoAjuste <= 0)
                return BadRequest("Debe informar el tipo de ajuste.");

            var tipoAjusteExiste = await _context.Set<ef_param_programa_tipos_ajuste>()
                .AsNoTracking()
                .AnyAsync(x => x.id_tipo_ajuste == req.IdTipoAjuste && x.activo == true);

            if (!tipoAjusteExiste)
                return BadRequest("El tipo de ajuste no existe o está inactivo.");

            if (req.Importe <= 0)
                return BadRequest("El importe debe ser mayor a cero.");

            var ajuste = new ef_programa_inscripcion_ajustes
            {
                id_inscripcion = idInscripcion,
                tipo = tipo,
                id_tipo_ajuste = req.IdTipoAjuste,
                descripcion = string.IsNullOrWhiteSpace(req.Descripcion) ? null : req.Descripcion.Trim(),
                importe = req.Importe,
                moneda = string.IsNullOrWhiteSpace(req.Moneda) ? insc.moneda : req.Moneda.Trim().ToUpper(),
                activo = true,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Set<ef_programa_inscripcion_ajustes>().Add(ajuste);
            await _context.SaveChangesAsync();

            return Ok(await ArmarOperacionResponseAsync(idInscripcion));
        }

        [HttpPost("inscripciones/{idInscripcion:long}/pagos")]
        public async Task<ActionResult<ProgramaInscripcionOperacionPagoResponse>> RegistrarPago(
            long idInscripcion,
            [FromBody] ProgramaInscripcionRegistrarPagoRequest req)
        {
            var insc = await _context.Set<ef_programa_inscripciones>()
                .SingleOrDefaultAsync(x => x.id_inscripcion == idInscripcion && x.activo == true);

            if (insc == null)
                return NotFound("Inscripción no encontrada.");

            if (req.Importe <= 0)
                return BadRequest("El importe debe ser mayor a cero.");

            if (string.IsNullOrWhiteSpace(req.MedioPago))
                return BadRequest("Debe informar el medio de pago.");

            var estado = await ArmarResumenPagoAsync(idInscripcion);

            if (req.Importe > estado.Saldo)
                return BadRequest("El importe supera el saldo pendiente. Saldo actual: " + estado.Saldo + " " + estado.Moneda + ".");

            var pago = new ef_programa_inscripcion_pagos
            {
                id_inscripcion = idInscripcion,
                fecha_pago = DateTimeOffset.UtcNow,
                importe = req.Importe,
                moneda = string.IsNullOrWhiteSpace(req.Moneda) ? insc.moneda : req.Moneda.Trim().ToUpper(),
                medio_pago = req.MedioPago.Trim().ToUpper(),
                referencia = string.IsNullOrWhiteSpace(req.Referencia) ? null : req.Referencia.Trim(),
                observaciones = string.IsNullOrWhiteSpace(req.Observaciones) ? null : req.Observaciones.Trim(),
                anulado = false,
                fecha_alta = DateTimeOffset.UtcNow
            };

            _context.Set<ef_programa_inscripcion_pagos>().Add(pago);
            await _context.SaveChangesAsync();

            return Ok(await ArmarOperacionResponseAsync(idInscripcion));
        }

        [HttpPut("inscripciones/pagos/{idPago:long}/anular")]
        public async Task<ActionResult<ProgramaInscripcionOperacionPagoResponse>> AnularPago(
            long idPago,
            [FromBody] string? motivo)
        {
            var pago = await _context.Set<ef_programa_inscripcion_pagos>()
                .SingleOrDefaultAsync(x => x.id_inscripcion_pago == idPago);

            if (pago == null)
                return NotFound("Pago no encontrado.");

            if (pago.anulado)
                return BadRequest("El pago ya está anulado.");

            pago.anulado = true;
            pago.fecha_anulacion = DateTimeOffset.UtcNow;
            pago.motivo_anulacion = string.IsNullOrWhiteSpace(motivo) ? "Anulado manualmente" : motivo.Trim();
            pago.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(await ArmarOperacionResponseAsync(pago.id_inscripcion));
        }

        private async Task<ProgramaInscripcionPagoListItemDTO> ArmarResumenPagoAsync(long idInscripcion)
        {
            var insc = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .SingleAsync(x => x.id_inscripcion == idInscripcion);

            var participantes = await GetParticipantesAsync(insc.id_rsvp_grupo);

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

            var totalOriginal = insc.total_general;
            var totalAPagar = totalOriginal - descuentos + recargos;

            if (totalAPagar < 0)
                totalAPagar = 0;

            var totalPagado = pagos.Sum(x => x.importe);
            var saldo = totalAPagar - totalPagado;

            if (saldo < 0)
                saldo = 0;

            return new ProgramaInscripcionPagoListItemDTO
            {
                IdInscripcion = insc.id_inscripcion,
                IdRsvpGrupo = insc.id_rsvp_grupo,
                Responsable = (insc.responsable_nombre + " " + insc.responsable_apellido).Trim(),
                Email = insc.responsable_email,
                Telefono = insc.responsable_telefono,
                Participantes = participantes,
                TotalOriginal = totalOriginal,
                TotalDescuentos = descuentos,
                TotalRecargos = recargos,
                TotalAPagar = totalAPagar,
                TotalPagado = totalPagado,
                Saldo = saldo,
                Moneda = insc.moneda,
                EstadoPago = ResolverEstadoPago(totalAPagar, totalPagado)
            };
        }

        private async Task<ProgramaInscripcionOperacionPagoResponse> ArmarOperacionResponseAsync(long idInscripcion)
        {
            var r = await ArmarResumenPagoAsync(idInscripcion);

            return new ProgramaInscripcionOperacionPagoResponse
            {
                Ok = true,
                IdInscripcion = r.IdInscripcion,
                TotalOriginal = r.TotalOriginal,
                TotalDescuentos = r.TotalDescuentos,
                TotalRecargos = r.TotalRecargos,
                TotalAPagar = r.TotalAPagar,
                TotalPagado = r.TotalPagado,
                Saldo = r.Saldo,
                EstadoPago = r.EstadoPago
            };
        }

        private async Task<List<string>> GetParticipantesAsync(long? idRsvpGrupo)
        {
            if (!idRsvpGrupo.HasValue)
                return new List<string>();

            return await (
                from gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                where gi.id_rsvp_grupo == idRsvpGrupo.Value
                      && gi.requiere_asistencia == true
                orderby gi.orden
                select (inv.nombre + " " + inv.apellido)
            ).ToListAsync();
        }

        private async Task<List<ProgramaInscripcionDetallePeriodoDTO>> GetDetallePeriodosAsync(long idInscripcion)
        {
            return await (
                from p in _context.Set<ef_programa_inscripcion_periodos>().AsNoTracking()
                join gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    on p.id_rsvp_grupo_integrante equals gi.id_rsvp_grupo_integrante
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                where p.id_inscripcion == idInscripcion && p.activo == true
                orderby inv.apellido, inv.nombre, p.fecha_desde
                select new ProgramaInscripcionDetallePeriodoDTO
                {
                    Participante = inv.nombre + " " + inv.apellido,
                    Nombre = p.nombre,
                    FechaDesde = p.fecha_desde,
                    FechaHasta = p.fecha_hasta,
                    PrecioBase = p.precio_base,
                    Moneda = p.moneda
                }
            ).ToListAsync();
        }

        private async Task<List<ProgramaInscripcionDetalleServicioDTO>> GetDetalleServiciosAsync(long idInscripcion)
        {
            var servicios = await (
                from s in _context.Set<ef_programa_inscripcion_servicios>().AsNoTracking()
                join gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                    on s.id_rsvp_grupo_integrante equals gi.id_rsvp_grupo_integrante
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                where s.id_inscripcion == idInscripcion && s.activo == true
                orderby inv.apellido, inv.nombre, s.nombre
                select new
                {
                    s.id_inscripcion_servicio,
                    Participante = inv.nombre + " " + inv.apellido,
                    s.codigo,
                    s.nombre,
                    s.tipo_calculo,
                    s.precio,
                    s.subtotal,
                    s.moneda,
                    s.cantidad
                }
            ).ToListAsync();

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

            return servicios.Select(s =>
            {
                var dias = diasPorServicio
                    .FirstOrDefault(x => x.IdInscripcionServicio == s.id_inscripcion_servicio)
                    ?.CantidadDias ?? 0;

                var cantidadCalculada =
                    s.tipo_calculo == "POR_DIA"
                        ? dias
                        : (s.cantidad ?? 1);

                return new ProgramaInscripcionDetalleServicioDTO
                {
                    Participante = s.Participante,
                    Codigo = s.codigo,
                    Nombre = s.nombre,
                    TipoCalculo = s.tipo_calculo,
                    Precio = s.precio,
                    CantidadCalculada = cantidadCalculada,
                    Subtotal = s.subtotal,
                    Moneda = s.moneda
                };
            }).ToList();
        }

        private async Task<List<ProgramaInscripcionAjusteDTO>> GetAjustesAsync(long idInscripcion, short idIdioma)
        {
            return await (
                from a in _context.Set<ef_programa_inscripcion_ajustes>().AsNoTracking()
                join ta in _context.Set<ef_param_programa_tipos_ajuste>().AsNoTracking()
                    on a.id_tipo_ajuste equals ta.id_tipo_ajuste
                where a.id_inscripcion == idInscripcion
                orderby a.fecha_alta descending
                select new ProgramaInscripcionAjusteDTO
                {
                    IdInscripcionAjuste = a.id_inscripcion_ajuste,
                    Tipo = a.tipo,
                    IdTipoAjuste = a.id_tipo_ajuste,
                    TipoAjusteCodigo = ta.codigo,
                    TipoAjusteTexto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "PROGRAMA_TIPO_AJUSTE" &&
                            tr.id_item == ta.id_tipo_ajuste &&
                            tr.id_idioma == idIdioma &&
                            tr.activo == true)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? ta.codigo,
                    Descripcion = a.descripcion,
                    Importe = a.importe,
                    Moneda = a.moneda,
                    Activo = a.activo,
                    FechaAlta = a.fecha_alta
                }
            ).ToListAsync();
        }

        private async Task<List<ProgramaInscripcionPagoDTO>> GetPagosAsync(long idInscripcion)
        {
            return await _context.Set<ef_programa_inscripcion_pagos>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion)
                .OrderByDescending(x => x.fecha_pago)
                .Select(x => new ProgramaInscripcionPagoDTO
                {
                    IdInscripcionPago = x.id_inscripcion_pago,
                    FechaPago = x.fecha_pago,
                    Importe = x.importe,
                    Moneda = x.moneda,
                    MedioPago = x.medio_pago,
                    Referencia = x.referencia,
                    Observaciones = x.observaciones,
                    Anulado = x.anulado
                })
                .ToListAsync();
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
    }
}
