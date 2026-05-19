using System;

namespace API.DataSchema
{
    public class ef_evento_regalos_lista_reservas
    {
        public long id_reserva { get; set; }
        public long id_evento { get; set; }
        public long id_regalo_item { get; set; }

        public long? id_invitado { get; set; }
        public string? rsvp_token { get; set; }

        public string? nombre_mostrado { get; set; }
        public bool es_anonimo { get; set; } = false;

        public int cantidad { get; set; } = 1;
        public string estado { get; set; } = "RESERVA_ACTIVA"; // RESERVA_ACTIVA / CANCELADA / VENCIDA

        public string? mensaje { get; set; }

        public DateTimeOffset fecha_reserva { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_vencimiento { get; set; } // (no usamos)
        public DateTimeOffset? fecha_cancelacion { get; set; }

        public bool activo { get; set; } = true;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_eventos? ef_eventos { get; set; }
        public virtual ef_evento_regalos_lista_items? ef_evento_regalos_lista_items { get; set; }
        public virtual ef_invitados? ef_invitados { get; set; }
    }
}