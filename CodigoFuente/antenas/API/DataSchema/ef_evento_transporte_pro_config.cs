using System;

namespace API.DataSchema
{
    public class ef_evento_transporte_pro_config
    {
        public long id_evento { get; set; }

        public bool pro_habilitado { get; set; } = false;
        public bool requiere_pago { get; set; } = false;

        public int max_plazas_por_reserva { get; set; } = 4;
        public bool permitir_reservar_ida { get; set; } = true;
        public bool permitir_reservar_vuelta { get; set; } = true;
        public int? vencimiento_minutos_pago { get; set; }

        public string? pago_titular_cuenta { get; set; }
        public string? pago_cbu_alias { get; set; }
        public string? pago_banco { get; set; }
        public string? pago_instrucciones { get; set; }

        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_eventos? ef_eventos { get; set; }
    }
}