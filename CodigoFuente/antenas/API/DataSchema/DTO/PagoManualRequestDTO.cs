using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class PagoManualRequestDTO
    {
        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("codigo_plan")]
        public string CodigoPlan { get; set; } = null!;

        [JsonPropertyName("moneda")]
        public string Moneda { get; set; } = "ARS";

        [JsonPropertyName("importe")]
        public decimal Importe { get; set; }

        [JsonPropertyName("concepto")]
        public string? Concepto { get; set; }
    }
}
