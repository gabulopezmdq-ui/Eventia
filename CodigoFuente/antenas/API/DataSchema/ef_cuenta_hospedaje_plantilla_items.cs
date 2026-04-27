using System;

namespace API.DataSchema
{
    public class ef_cuenta_hospedaje_plantilla_items
    {
        public long id_hospedaje_plantilla_item { get; set; }
        public long id_hospedaje_plantilla { get; set; }

        public string nombre { get; set; } = null!;
        public string? tipo { get; set; }
        public string? zona { get; set; }
        public string? direccion { get; set; }

        public string? url_externa { get; set; }
        public string? telefono { get; set; }
        public string? whatsapp { get; set; }

        public decimal? latitud { get; set; }
        public decimal? longitud { get; set; }

        public string[] etiquetas { get; set; } = Array.Empty<string>();
        public string? nota_publica { get; set; }

        public bool recomendado { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public ef_cuenta_hospedaje_plantillas? plantilla { get; set; }
        public ef_cuenta_hospedaje_plantilla_item_bloques? bloque { get; set; }
    }
}
