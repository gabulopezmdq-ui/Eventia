using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class HospedajeDTO
    {
        [JsonPropertyName("id_hospedaje")]
        public long id_hospedaje { get; set; }

        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("tipo")]
        public string? tipo { get; set; }

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

        // códigos: FAMILY, NEAR, PARKING, etc.
        [JsonPropertyName("etiquetas")]
        public List<string> etiquetas { get; set; } = new List<string>();

        [JsonPropertyName("nota_publica")]
        public string? nota_publica { get; set; }

        [JsonPropertyName("recomendado")]
        public bool recomendado { get; set; }

        [JsonPropertyName("orden")]
        public short orden { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("bloque")]
        public HospedajeBloqueDTO? bloque { get; set; }
    }
}