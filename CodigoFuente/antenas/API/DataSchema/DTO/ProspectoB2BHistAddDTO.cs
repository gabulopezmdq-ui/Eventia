using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class ProspectoB2BHistAddDTO
    {
        [JsonPropertyName("tipo")]
        public string tipo { get; set; } = "NOTA"; // NOTA/CONTACTO/CAMBIO_ESTADO/ASIGNACION

        [JsonPropertyName("detalle")]
        public string detalle { get; set; } = null!;

        [JsonPropertyName("estado_nuevo")]
        public string? estado_nuevo { get; set; }

        [JsonPropertyName("proximo_contacto")]
        public DateTimeOffset? proximo_contacto { get; set; }
    }
}