using System;

namespace API.DataSchema
{
    public class ef_precios
    {
        public long id_precio { get; set; }

        public string objeto_tipo { get; set; } = null!; // PLAN / ADDON
        public long? id_plan { get; set; }
        public long? id_addon { get; set; }

        public string mercado { get; set; } = null!;
        public string moneda { get; set; } = null!;
        public decimal importe { get; set; }

        public bool impuestos_incluidos { get; set; }
        public string? tax_json { get; set; }

        public DateTimeOffset vigente_desde { get; set; }
        public DateTimeOffset? vigente_hasta { get; set; }

        public bool activo { get; set; }
        public string? motivo { get; set; }
        public string? metadata_json { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}

