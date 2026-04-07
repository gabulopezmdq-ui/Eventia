using System;
using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    public class CobranzaCuentaItemDTO
    {
        [JsonProperty("id_cuenta")]
        public long id_cuenta { get; set; }

        [JsonProperty("nombre_cuenta")]
        public string nombre_cuenta { get; set; } = null!;

        [JsonProperty("tipo")]
        public string tipo { get; set; } = null!;

        [JsonProperty("cuenta_estado")]
        public string cuenta_estado { get; set; } = null!;

        [JsonProperty("id_plan")]
        public long? id_plan { get; set; }

        [JsonProperty("plan_codigo")]
        public string? plan_codigo { get; set; }

        [JsonProperty("plan_nombre")]
        public string? plan_nombre { get; set; }

        [JsonProperty("id_suscripcion")]
        public long? id_suscripcion { get; set; }

        [JsonProperty("suscripcion_estado")]
        public string? suscripcion_estado { get; set; }

        [JsonProperty("periodo")]
        public string? periodo { get; set; }

        [JsonProperty("current_period_end")]
        public DateTimeOffset? current_period_end { get; set; }

        [JsonProperty("dias_para_vencer")]
        public int? dias_para_vencer { get; set; }

        [JsonProperty("concepto")]
        public string? concepto { get; set; }

        [JsonProperty("inconsistente")]
        public bool inconsistente { get; set; }
    }
}
