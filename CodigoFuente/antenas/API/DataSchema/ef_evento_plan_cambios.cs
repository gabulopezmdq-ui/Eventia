using System;

namespace API.DataSchema
{
    public class ef_evento_plan_cambios
    {
        public long id_evento_plan_cambio { get; set; }

        public long id_evento { get; set; }

        public long id_plan_actual { get; set; }
        public long id_plan_solicitado { get; set; }

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
        public long? id_usuario_admin { get; set; }

        public DateTimeOffset fecha_solicitud { get; set; }
        public DateTimeOffset? fecha_resolucion { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}