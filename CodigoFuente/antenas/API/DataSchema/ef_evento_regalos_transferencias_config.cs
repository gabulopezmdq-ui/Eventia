using System;

namespace API.DataSchema
{
    public class ef_evento_regalos_transferencias_config
    {
        public long id_evento { get; set; }

        public string titulo { get; set; } = "Regalos";
        public string? texto_intro { get; set; }

        public bool activo { get; set; } = true;

        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        public virtual ef_eventos? ef_eventos { get; set; }
    }
}