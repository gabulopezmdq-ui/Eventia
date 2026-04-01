using System;

namespace API.DataSchema
{
    public class ef_suscripciones
    {
        public long id_suscripcion { get; set; }

        public string scope { get; set; } = null!; // CUENTA / EVENTO
        public long? id_cuenta { get; set; }
        public long? id_evento { get; set; }

        public long id_plan { get; set; }

        public string estado { get; set; } = null!; // PENDIENTE/ACTIVA/...
        public bool auto_renueva { get; set; }
        public string periodo { get; set; } = null!; // MENSUAL/ANUAL/UNICO

        public DateTimeOffset? current_period_start { get; set; }
        public DateTimeOffset? current_period_end { get; set; }

        public bool cancel_at_period_end { get; set; }
        public DateTimeOffset? cancelled_at { get; set; }

        public string? external_provider { get; set; }
        public string? external_subscription_id { get; set; }
        public string? external_customer_id { get; set; }

        public bool activo { get; set; }
        public string? config_json { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
        public DateTimeOffset? trial_end { get; set; }
    }
}