using System;

namespace API.DataSchema
{
    public class ef_evento_regalos_transferencias
    {
        public long id_evento_regalo_transferencia { get; set; }
        public long id_evento { get; set; }

        public string codigo_moneda { get; set; } = null!;
        public string? titulo { get; set; }

        public string datos_transferencia_texto { get; set; } = null!;
        public string? instrucciones { get; set; }

        public short orden { get; set; } = 1;
        public bool activo { get; set; } = true;

        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_eventos? ef_eventos { get; set; }
        public virtual ef_monedas? ef_monedas { get; set; }
    }
}