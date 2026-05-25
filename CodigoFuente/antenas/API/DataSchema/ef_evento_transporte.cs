using System;

namespace API.DataSchema
{
    public class ef_evento_transporte
    {
        public long id_evento { get; set; }

        public string? info_publica { get; set; } // texto visible a invitados

        public bool activo { get; set; } = true;

        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_eventos? ef_eventos { get; set; }
    }
}