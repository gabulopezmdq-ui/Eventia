using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class PagoPendienteItemDTO
    {
        [JsonPropertyName("id_pago")]
        public long id_pago { get; set; }

        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("evento_estado")]
        public string evento_estado { get; set; } = null!;

        [JsonPropertyName("plan_codigo")]
        public string? plan_codigo { get; set; }

        [JsonPropertyName("plan_nombre")]
        public string? plan_nombre { get; set; }

        [JsonPropertyName("tipo_evento_codigo")]
        public string? tipo_evento_codigo { get; set; }

        [JsonPropertyName("anfitriones_texto")]
        public string? anfitriones_texto { get; set; }

        [JsonPropertyName("moneda")]
        public string moneda { get; set; } = null!;

        [JsonPropertyName("importe")]
        public decimal importe { get; set; }

        [JsonPropertyName("fecha_alta_pago")]
        public DateTimeOffset fecha_alta_pago { get; set; }

        [JsonPropertyName("concepto")]
        public string? concepto { get; set; }

        // si detectamos un evento en P sin pago pendiente real, lo marcamos
        [JsonPropertyName("inconsistente")]
        public bool inconsistente { get; set; }
    }
}
