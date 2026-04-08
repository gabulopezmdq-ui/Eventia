using System;
using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    public class CuentaPagoItemDTO
    {
        [JsonProperty("id_pago")] public long id_pago { get; set; }
        [JsonProperty("fecha_alta")] public DateTimeOffset fecha_alta { get; set; }
        [JsonProperty("estado")] public string estado { get; set; } = null!;
        [JsonProperty("moneda")] public string moneda { get; set; } = null!;
        [JsonProperty("importe")] public decimal importe { get; set; }
        [JsonProperty("concepto")] public string? concepto { get; set; }
    }
}
