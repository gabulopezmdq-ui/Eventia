using System;
using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    public class CuentaComercialResponseDTO
    {
        [JsonProperty("id_cuenta")] public long id_cuenta { get; set; }
        [JsonProperty("cuenta_estado")] public string cuenta_estado { get; set; } = null!;

        [JsonProperty("plan_codigo")] public string? plan_codigo { get; set; }
        [JsonProperty("plan_nombre")] public string? plan_nombre { get; set; }
        [JsonProperty("periodo")] public string? periodo { get; set; }

        [JsonProperty("suscripcion_estado")] public string? suscripcion_estado { get; set; }
        [JsonProperty("current_period_end")] public DateTimeOffset? current_period_end { get; set; }

        [JsonProperty("dias_para_vencer")] public int? dias_para_vencer { get; set; }
        [JsonProperty("vencida")] public bool vencida { get; set; }

        [JsonProperty("pago_pendiente")] public bool pago_pendiente { get; set; }
        [JsonProperty("mensaje")] public string? mensaje { get; set; }
    }
}