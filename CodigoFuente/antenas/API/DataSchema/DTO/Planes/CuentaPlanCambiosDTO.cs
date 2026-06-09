using System;

namespace API.DataSchema.DTO.Planes
{
    public class SolicitarCambioPlanCuentaDTO
    {
        public string codigo_plan_solicitado { get; set; } = null!;
        public string? motivo_solicitud { get; set; }
    }

    public class CuentaCambioPlanDTO
    {
        public long id_cuenta_plan_cambio { get; set; }
        public long id_cuenta { get; set; }

        public string cuenta_nombre { get; set; } = null!;

        public string plan_actual_codigo { get; set; } = null!;
        public string plan_actual_nombre { get; set; } = null!;

        public string plan_solicitado_codigo { get; set; } = null!;
        public string plan_solicitado_nombre { get; set; } = null!;

        public string estado { get; set; } = null!;

        public string codigo_mercado { get; set; } = null!;
        public string codigo_moneda { get; set; } = null!;

        public decimal precio_plan_actual_reconocido { get; set; }
        public decimal precio_plan_solicitado_lista { get; set; }
        public decimal precio_plan_solicitado_publicado { get; set; }

        public decimal diferencia_base { get; set; }

        public string? tipo_ajuste { get; set; }
        public decimal? importe_ajuste { get; set; }
        public string? motivo_ajuste { get; set; }
        public string? descripcion_ajuste { get; set; }

        public decimal total_a_cobrar { get; set; }

        public string? motivo_solicitud { get; set; }
        public string? observacion_admin { get; set; }

        public long id_usuario_solicita { get; set; }
        public DateTimeOffset fecha_solicitud { get; set; }
    }

    public class AdminAprobarCambioPlanCuentaDTO
    {
        public long id_cuenta_plan_cambio { get; set; }

        public string? tipo_ajuste { get; set; }
        public decimal? importe_ajuste { get; set; }
        public string? motivo_ajuste { get; set; }
        public string? descripcion_ajuste { get; set; }

        public decimal? importe_pagado { get; set; }

        public string? medio_pago { get; set; }
        public string? referencia_pago { get; set; }
        public string? observacion_admin { get; set; }
    }

    public class AdminRechazarCambioPlanCuentaDTO
    {
        public long id_cuenta_plan_cambio { get; set; }
        public string? observacion_admin { get; set; }
    }
}