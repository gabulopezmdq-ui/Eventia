using System;

namespace API.DataSchema
{
    public class ef_evento_regalos_fondos
    {
        public long id_fondo { get; set; }
        public long id_evento { get; set; }

        public string titulo { get; set; } = null!;
        public string? descripcion_publica { get; set; }

        public string moneda_base { get; set; } = "ARS";
        public string modo_confirmacion { get; set; } = "INVITADO_Y_ORGANIZADOR"; // INVITADO_Y_ORGANIZADOR / SOLO_ORGANIZADOR

        public bool permitir_excedente { get; set; } = true;
        public bool mostrar_pendientes { get; set; } = true;
        public bool mostrar_muro_mensajes { get; set; } = true;
        public bool permitir_anonimo { get; set; } = true;

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_eventos? ef_eventos { get; set; }
    }
}