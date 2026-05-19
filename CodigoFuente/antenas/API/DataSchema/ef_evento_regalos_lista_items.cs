using System;

namespace API.DataSchema
{
    public class ef_evento_regalos_lista_items
    {
        public long id_regalo_item { get; set; }
        public long id_evento { get; set; }

        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public int cantidad_total { get; set; } = 1;
        public bool permitir_excedente { get; set; } = false;

        public string? url_referencia { get; set; }
        public string? imagen_url { get; set; }

        public short orden { get; set; } = 1;
        public bool visible { get; set; } = true;

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_eventos? ef_eventos { get; set; }
    }
}