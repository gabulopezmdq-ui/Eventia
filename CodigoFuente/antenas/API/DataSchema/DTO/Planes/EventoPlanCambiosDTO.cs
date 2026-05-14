using System;

namespace API.DataSchema.DTO.Planes
{
    public class SolicitarCambioPlanDTO
    {
        public string codigo_plan_solicitado { get; set; } = null!;
        public string? motivo_solicitud { get; set; }
    }

    public class CambioPlanDTO
    {
        public long id_evento_plan_cambio { get; set; }
        public long id_evento { get; set; }

        public string plan_actual_codigo { get; set; } = null!;
        public string plan_solicitado_codigo { get; set; } = null!;

        public string codigo_mercado { get; set; } = null!;
        public string codigo_moneda { get; set; } = null!;

        public decimal precio_plan_actual_reconocido { get; set; }
        public decimal precio_plan_solicitado_publicado { get; set; }
        public decimal diferencia_base { get; set; }
        public decimal total_a_cobrar { get; set; }

        public string estado { get; set; } = null!;
        public DateTimeOffset fecha_solicitud { get; set; }
    }
}