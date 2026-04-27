using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_hospedajes : IRegistroUnico
    {
        public long id_hospedaje { get; set; }
        public long id_evento { get; set; }

        public string nombre { get; set; } = null!;
        public string? tipo { get; set; } // HOTEL/APART/HOSTEL/CASA/OTRO

        public string? zona { get; set; }
        public string? direccion { get; set; }

        public string? url_externa { get; set; }   // ✅ nombre neutral
        public string? telefono { get; set; }
        public string? whatsapp { get; set; }

        public decimal? latitud { get; set; }
        public decimal? longitud { get; set; }

        public long? id_tramo_referencia { get; set; }

        public decimal? precio_desde { get; set; }
        public decimal? precio_hasta { get; set; }
        public string? moneda { get; set; } // ARS/USD/EUR

        // ✅ Etiquetas como códigos: ["FAMILY","NEAR","PARKING"]
        public string[] etiquetas { get; set; } = Array.Empty<string>();

        public string? nota_publica { get; set; }

        public bool recomendado { get; set; } = false;
        public short orden { get; set; } = 1;
        public bool activo { get; set; } = true;

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        // Navigations (opcional si las necesitás)
        public virtual ef_eventos? evento { get; set; }
        public virtual ef_evento_tramos? tramo_referencia { get; set; }
        public virtual ICollection<ef_evento_hospedaje_bloques>? bloques { get; set; }
    }
}