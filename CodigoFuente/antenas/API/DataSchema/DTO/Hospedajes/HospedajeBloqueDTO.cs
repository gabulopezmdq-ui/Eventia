using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class HospedajeBloqueDTO
    {
        [JsonPropertyName("nombre_reserva")]
        public string? nombre_reserva { get; set; }

        [JsonPropertyName("codigo_promocional")]
        public string? codigo_promocional { get; set; }

        [JsonPropertyName("fecha_limite_reserva")]
        public DateTime? fecha_limite_reserva { get; set; }

        [JsonPropertyName("condiciones")]
        public string? condiciones { get; set; }

        [JsonPropertyName("url_bloque")]
        public string? url_bloque { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; } = true;
    }
}
