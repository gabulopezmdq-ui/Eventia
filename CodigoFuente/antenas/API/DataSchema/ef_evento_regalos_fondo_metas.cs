using System;

namespace API.DataSchema
{
    public class ef_evento_regalos_fondo_metas
    {
        public long id_meta { get; set; }
        public long id_fondo { get; set; }
        public long id_evento { get; set; }

        public string tipo_meta { get; set; } = "GENERICA"; // GENERICA / EXPERIENCIA / PRODUCTO
        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }

        public decimal objetivo_monto { get; set; }

        public string? url_referencia { get; set; }
        public string? imagen_url { get; set; }

        public short orden { get; set; } = 1;
        public bool visible { get; set; } = true;

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public virtual ef_evento_regalos_fondos? ef_evento_regalos_fondos { get; set; }
        public virtual ef_eventos? ef_eventos { get; set; }
    }
}