using API.DataSchema;
using API.DataSchema.DTO.Features;
using API.Services.Features;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Features.Sections
{
    public class PagosPortalSectionProvider : IPortalSectionProvider
    {
        private readonly DataContext _context;

        public string Codigo => "PAGOS";

        public PagosPortalSectionProvider(DataContext context)
        {
            _context = context;
        }

        public async Task<object?> GetDataAsync(
            PortalContextDTO context,
            int idIdioma,
            bool desbloqueadoSensible)
        {
            if (!context.EsPrograma || !context.IdInscripcion.HasValue)
                return null;

            long idInscripcion = context.IdInscripcion.Value;

            var inscripcion = await _context.ef_programa_inscripciones
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion && x.activo == true)
                .Select(x => new
                {
                    x.id_inscripcion,
                    x.id_evento,
                    x.id_rsvp_grupo,
                    x.responsable_nombre,
                    x.responsable_apellido,
                    x.responsable_email,
                    x.responsable_telefono,
                    x.moneda,
                    x.total_general
                })
                .FirstOrDefaultAsync();

            if (inscripcion == null)
                return null;

            var ajustes = await (
                from a in _context.ef_programa_inscripcion_ajustes.AsNoTracking()
                join tipo0 in _context.ef_param_programa_tipos_ajuste.AsNoTracking()
                    on a.id_tipo_ajuste equals tipo0.id_tipo_ajuste into gjTipo
                from tipo in gjTipo.DefaultIfEmpty()
                where a.id_inscripcion == idInscripcion
                   && a.activo == true
                orderby a.fecha_alta descending
                select new
                {
                    a.id_inscripcion_ajuste,
                    a.id_inscripcion,
                    a.tipo,
                    a.id_tipo_ajuste,
                    tipo_ajuste_codigo = tipo != null ? tipo.codigo : null,
                    tipo_ajuste_texto = tipo != null ? tipo.codigo : null,
                    a.descripcion,
                    a.importe,
                    a.moneda,
                    a.activo,
                    a.fecha_alta
                }
            ).ToListAsync();

            var pagos = await _context.ef_programa_inscripcion_pagos
                .AsNoTracking()
                .Where(x => x.id_inscripcion == idInscripcion)
                .OrderByDescending(x => x.fecha_pago)
                .ThenByDescending(x => x.id_inscripcion_pago)
                .Select(x => new
                {
                    x.id_inscripcion_pago,
                    x.id_inscripcion,
                    x.fecha_pago,
                    x.importe,
                    x.moneda,
                    x.medio_pago,
                    x.referencia,
                    x.observaciones,
                    x.anulado,
                    x.fecha_anulacion,
                    x.motivo_anulacion
                })
                .ToListAsync();

            decimal totalOriginal = inscripcion.total_general;
            decimal totalDescuentos = ajustes
                .Where(x => x.tipo == "DESCUENTO")
                .Sum(x => x.importe);

            decimal totalBonificaciones = ajustes
                .Where(x => x.tipo == "BONIFICACION")
                .Sum(x => x.importe);

            decimal totalRecargos = ajustes
                .Where(x => x.tipo == "RECARGO")
                .Sum(x => x.importe);

            decimal totalAPagar =
                totalOriginal
                - totalDescuentos
                - totalBonificaciones
                + totalRecargos;

            decimal totalPagado = pagos
                .Where(x => x.anulado == false)
                .Sum(x => x.importe);

            decimal saldo = totalAPagar - totalPagado;
            if (saldo < 0) saldo = 0;

            string estadoPago;

            if (totalAPagar <= 0)
                estadoPago = "SIN_CARGO";
            else if (totalPagado <= 0)
                estadoPago = "PENDIENTE";
            else if (saldo <= 0)
                estadoPago = "PAGADO";
            else
                estadoPago = "PARCIAL";

            return new
            {
                resumen = new
                {
                    id_inscripcion = idInscripcion,
                    responsable = (inscripcion.responsable_nombre + " " + inscripcion.responsable_apellido).Trim(),
                    email = inscripcion.responsable_email,
                    telefono = inscripcion.responsable_telefono,
                    total_original = totalOriginal,
                    total_descuentos = totalDescuentos,
                    total_bonificaciones = totalBonificaciones,
                    total_recargos = totalRecargos,
                    total_a_pagar = totalAPagar,
                    total_pagado = totalPagado,
                    saldo,
                    moneda = inscripcion.moneda,
                    estado_pago = estadoPago
                },
                ajustes,
                pagos
            };
        }
    }
}