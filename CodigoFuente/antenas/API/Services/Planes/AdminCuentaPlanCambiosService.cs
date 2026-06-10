using API.DataSchema;
using API.DataSchema.DTO.Planes;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace API.Services.Planes
{
    public class AdminCuentaPlanCambiosService : IAdminCuentaPlanCambiosService
    {
        private readonly DataContext _context;

        public AdminCuentaPlanCambiosService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<CuentaCambioPlanDTO>> GetPendientesAsync()
        {
            return await GetQuery()
                .Where(x => x.estado == "PENDIENTE")
                .OrderByDescending(x => x.fecha_solicitud)
                .ToListAsync();
        }

        public async Task<CuentaCambioPlanDTO> GetByIdAsync(long id_cuenta_plan_cambio)
        {
            var item = await GetQuery()
                .FirstOrDefaultAsync(x => x.id_cuenta_plan_cambio == id_cuenta_plan_cambio);

            if (item == null)
                throw new Exception("Solicitud inexistente.");

            return item;
        }

        public async Task<bool> AprobarAsync(AdminAprobarCambioPlanCuentaDTO req, long id_usuario_admin)
        {
            if (req == null)
                throw new Exception("Body inválido.");

            if (req.id_cuenta_plan_cambio <= 0)
                throw new Exception("id_cuenta_plan_cambio inválido.");

            var cambio = await _context.ef_cuenta_plan_cambios
                .FirstOrDefaultAsync(x => x.id_cuenta_plan_cambio == req.id_cuenta_plan_cambio);

            if (cambio == null)
                throw new Exception("Solicitud inexistente.");

            if (cambio.estado != "PENDIENTE")
                throw new Exception("La solicitud no está pendiente.");

            var cuenta = await _context.ef_cuentas
                .FirstOrDefaultAsync(x => x.id_cuenta == cambio.id_cuenta);

            if (cuenta == null)
                throw new Exception("Cuenta inexistente.");

            var planSolicitado = await _context.ef_planes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_plan == cambio.id_plan_solicitado);

            if (planSolicitado == null)
                throw new Exception("Plan solicitado inexistente.");

            decimal totalAjustado = CalcularTotalAjustado(
                cambio.diferencia_base,
                req.tipo_ajuste,
                req.importe_ajuste
            );

            decimal importePagado = req.importe_pagado ?? totalAjustado;

            if (importePagado < 0)
                throw new Exception("El importe pagado no puede ser negativo.");

            var now = DateTimeOffset.UtcNow;

            await using var tx = await _context.Database.BeginTransactionAsync();

            cambio.tipo_ajuste = NormalizarNull(req.tipo_ajuste);
            cambio.importe_ajuste = req.importe_ajuste;
            cambio.motivo_ajuste = NormalizarNull(req.motivo_ajuste);
            cambio.descripcion_ajuste = NormalizarNull(req.descripcion_ajuste);
            cambio.total_a_cobrar = totalAjustado;
            cambio.observacion_admin = NormalizarNull(req.observacion_admin);
            cambio.id_usuario_admin = id_usuario_admin;
            cambio.estado = "APROBADO";
            cambio.fecha_resolucion = now;
            cambio.fecha_modif = now;

            cuenta.id_plan = cambio.id_plan_solicitado;
            cuenta.fecha_modif = now;

            _context.ef_pagos.Add(new ef_pagos
            {
                id_evento = null,
                id_cuenta = cambio.id_cuenta,
                id_suscripcion = null,

                tipo = "RECURRENTE",
                estado = "APROBADO",

                moneda = cambio.codigo_moneda,

                importe = importePagado,
                impuestos = 0,
                total = importePagado,

                concepto = $"Cambio de plan cuenta {cambio.id_cuenta} a {planSolicitado.codigo}",
                idempotency_key = $"CAMBIO_PLAN_CTA_{cambio.id_cuenta_plan_cambio}",

                objeto_tipo = "CAMBIO_PLAN_CUENTA",
                id_evento_plan_cambio = null,
                id_plan = cambio.id_plan_solicitado,
                id_addon = null,

                codigo_mercado = cambio.codigo_mercado,
                codigo_moneda = cambio.codigo_moneda,

                precio_lista_snapshot = cambio.precio_plan_solicitado_lista,
                precio_publicado_snapshot = cambio.precio_plan_solicitado_publicado,

                tipo_ajuste = cambio.tipo_ajuste,
                importe_ajuste = cambio.importe_ajuste,

                total_a_cobrar_snapshot = totalAjustado,
                importe_pagado = importePagado,

                medio_pago = NormalizarNull(req.medio_pago),
                referencia_pago = NormalizarNull(req.referencia_pago),
                observacion_admin = NormalizarNull(req.observacion_admin),

                snapshot_json = JsonSerializer.Serialize(new
                {
                    tipo = "CAMBIO_PLAN_CUENTA",
                    id_cuenta_plan_cambio = cambio.id_cuenta_plan_cambio,
                    id_cuenta = cambio.id_cuenta,
                    id_plan_actual = cambio.id_plan_actual,
                    id_plan_solicitado = cambio.id_plan_solicitado,
                    plan_solicitado_codigo = planSolicitado.codigo,
                    codigo_mercado = cambio.codigo_mercado,
                    codigo_moneda = cambio.codigo_moneda,
                    precio_plan_actual_reconocido = cambio.precio_plan_actual_reconocido,
                    precio_plan_solicitado_lista = cambio.precio_plan_solicitado_lista,
                    precio_plan_solicitado_publicado = cambio.precio_plan_solicitado_publicado,
                    diferencia_base = cambio.diferencia_base,
                    tipo_ajuste = cambio.tipo_ajuste,
                    importe_ajuste = cambio.importe_ajuste,
                    total_a_cobrar = totalAjustado,
                    importe_pagado = importePagado,
                    id_usuario_admin
                }),

                activo = true,
                fecha_alta = now
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return true;
        }

        public async Task<bool> RechazarAsync(AdminRechazarCambioPlanCuentaDTO req, long id_usuario_admin)
        {
            if (req == null)
                throw new Exception("Body inválido.");

            if (req.id_cuenta_plan_cambio <= 0)
                throw new Exception("id_cuenta_plan_cambio inválido.");

            var cambio = await _context.ef_cuenta_plan_cambios
                .FirstOrDefaultAsync(x => x.id_cuenta_plan_cambio == req.id_cuenta_plan_cambio);

            if (cambio == null)
                throw new Exception("Solicitud inexistente.");

            if (cambio.estado != "PENDIENTE")
                throw new Exception("La solicitud no está pendiente.");

            var now = DateTimeOffset.UtcNow;

            cambio.estado = "RECHAZADO";
            cambio.observacion_admin = NormalizarNull(req.observacion_admin);
            cambio.id_usuario_admin = id_usuario_admin;
            cambio.fecha_resolucion = now;
            cambio.fecha_modif = now;

            await _context.SaveChangesAsync();

            return true;
        }

        private IQueryable<CuentaCambioPlanDTO> GetQuery()
        {
            return
                from c in _context.ef_cuenta_plan_cambios.AsNoTracking()
                join cuenta in _context.ef_cuentas.AsNoTracking()
                    on c.id_cuenta equals cuenta.id_cuenta
                join pa in _context.ef_planes.AsNoTracking()
                    on c.id_plan_actual equals pa.id_plan
                join ps in _context.ef_planes.AsNoTracking()
                    on c.id_plan_solicitado equals ps.id_plan
                select new CuentaCambioPlanDTO
                {
                    id_cuenta_plan_cambio = c.id_cuenta_plan_cambio,
                    id_cuenta = c.id_cuenta,
                    cuenta_nombre = cuenta.nombre_cuenta,

                    plan_actual_codigo = pa.codigo,
                    plan_actual_nombre = pa.nombre,

                    plan_solicitado_codigo = ps.codigo,
                    plan_solicitado_nombre = ps.nombre,

                    estado = c.estado,

                    codigo_mercado = c.codigo_mercado,
                    codigo_moneda = c.codigo_moneda,

                    precio_plan_actual_reconocido = c.precio_plan_actual_reconocido,
                    precio_plan_solicitado_lista = c.precio_plan_solicitado_lista,
                    precio_plan_solicitado_publicado = c.precio_plan_solicitado_publicado,

                    diferencia_base = c.diferencia_base,

                    tipo_ajuste = c.tipo_ajuste,
                    importe_ajuste = c.importe_ajuste,
                    motivo_ajuste = c.motivo_ajuste,
                    descripcion_ajuste = c.descripcion_ajuste,

                    total_a_cobrar = c.total_a_cobrar,

                    motivo_solicitud = c.motivo_solicitud,
                    observacion_admin = c.observacion_admin,

                    id_usuario_solicita = c.id_usuario_solicita,
                    fecha_solicitud = c.fecha_solicitud
                };
        }

        private static decimal CalcularTotalAjustado(decimal diferenciaBase, string? tipoAjuste, decimal? importeAjuste)
        {
            if (importeAjuste == null || importeAjuste.Value == 0 || string.IsNullOrWhiteSpace(tipoAjuste))
                return diferenciaBase;

            tipoAjuste = tipoAjuste.Trim().ToUpperInvariant();

            if (tipoAjuste == "DESCUENTO" || tipoAjuste == "BONIFICACION")
            {
                var total = diferenciaBase - importeAjuste.Value;
                return total < 0 ? 0 : total;
            }

            if (tipoAjuste == "RECARGO")
                return diferenciaBase + importeAjuste.Value;

            throw new Exception("Tipo de ajuste inválido.");
        }

        private static string? NormalizarNull(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}