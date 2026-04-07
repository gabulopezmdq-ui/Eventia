using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    /// <summary>
    /// Campos comunes a cualquier pago manual (evento o cuenta).
    /// </summary>
    public class PagoManualBaseDTO
    {
        [JsonProperty("moneda")]
        public string Moneda { get; set; } = "ARS";

        [JsonProperty("importe")]
        public decimal Importe { get; set; }

        [JsonProperty("concepto")]
        public string? Concepto { get; set; }
    }
}

