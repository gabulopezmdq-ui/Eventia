using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class HospedajeUpsertRequestDTO
    {
        [JsonPropertyName("id_hospedaje")]
        public long? id_hospedaje { get; set; } // null => create

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("tipo")]
        public string? tipo { get; set; } // HOTEL/APART/HOSTEL/CASA/OTRO

        [JsonPropertyName("zona")]
        public string? zona { get; set; }

        [JsonPropertyName("direccion")]
        public string? direccion { get; set; }

        [JsonPropertyName("url_externa")]
        public string? url_externa { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("whatsapp")]
        public string? whatsapp { get; set; }

        [JsonPropertyName("latitud")]
        public decimal? latitud { get; set; }

        [JsonPropertyName("longitud")]
        public decimal? longitud { get; set; }

        [JsonPropertyName("id_tramo_referencia")]
        public long? id_tramo_referencia { get; set; }

        [JsonPropertyName("precio_desde")]
        public decimal? precio_desde { get; set; }

        [JsonPropertyName("precio_hasta")]
        public decimal? precio_hasta { get; set; }

        [JsonPropertyName("moneda")]
        public string? moneda { get; set; }

        [JsonPropertyName("etiquetas")]
        public List<string> etiquetas { get; set; } = new List<string>();

        [JsonPropertyName("nota_publica")]
        public string? nota_publica { get; set; }

        [JsonPropertyName("recomendado")]
        public bool recomendado { get; set; } = false;

        [JsonPropertyName("orden")]
        public short orden { get; set; } = 1;

        [JsonPropertyName("activo")]
        public bool activo { get; set; } = true;

        [JsonPropertyName("bloque")]
        public HospedajeBloqueDTO? bloque { get; set; }
    }
}