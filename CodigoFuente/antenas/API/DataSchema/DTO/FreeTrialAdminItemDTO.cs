using System;

namespace API.DataSchema.DTO
{
    public class FreeTrialAdminItemDTO
    {
        public long id_evento { get; set; }
        public string evento_estado { get; set; } = null!;

        public string tipo_evento_codigo { get; set; } = null!;
        public string anfitriones_texto { get; set; } = null!;
        public DateTimeOffset fecha_alta_evento { get; set; }

        public string plan_codigo { get; set; } = null!;
        public string plan_nombre { get; set; } = null!;

        public DateTimeOffset? trial_fin { get; set; }
        public int? dias_restantes { get; set; }
        public bool? vencido { get; set; }

        public long? id_usuario_owner { get; set; }
        public string? owner_email { get; set; }

        public bool convertido_a_pago { get; set; }   // true si hay suscripción ACTIVA posterior no FREE
    }
}
