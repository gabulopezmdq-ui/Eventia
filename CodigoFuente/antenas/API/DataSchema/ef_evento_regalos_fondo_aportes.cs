using System;

namespace API.DataSchema
{
    public class ef_evento_regalos_fondo_aportes
    {
        public long id_aporte { get; set; }
        public long id_evento { get; set; }
        public long id_fondo { get; set; }
        public long id_meta { get; set; }

        public long? id_invitado { get; set; }
        public string? rsvp_token { get; set; }

        public string? nombre_mostrado { get; set; }
        public bool es_anonimo { get; set; } = false;

        public decimal? monto_aporte { get; set; }
        public string? moneda_aporte { get; set; }

        public decimal? monto_base_calculado { get; set; }
        public decimal? tipo_cambio_usado { get; set; }

        public string estado { get; set; } = "DECLARADO"; // DECLARADO / PENDIENTE_CONFIRMACION / CONFIRMADO / RECHAZADO / ANULADO
        public string? mensaje { get; set; }
        public bool mostrar_en_muro { get; set; } = true;

        public string? comprobante_url { get; set; }

        public DateTimeOffset fecha_declara { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_confirma { get; set; }
        public long? id_usuario_confirma { get; set; }

        public bool activo { get; set; } = true;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_eventos? ef_eventos { get; set; }
        public virtual ef_evento_regalos_fondos? ef_evento_regalos_fondos { get; set; }
        public virtual ef_evento_regalos_fondo_metas? ef_evento_regalos_fondo_metas { get; set; }
        public virtual ef_invitados? ef_invitados { get; set; }
        public virtual ef_usuarios? ef_usuarios { get; set; }
    }
}