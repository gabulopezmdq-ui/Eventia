using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class MiPlanCuentaDTO
    {
        [JsonPropertyName("id_cuenta")]
        public long id_cuenta { get; set; }

        [JsonPropertyName("nombre_cuenta")]
        public string nombre_cuenta { get; set; } = null!;

        [JsonPropertyName("tipo")]
        public string tipo { get; set; } = null!;

        [JsonPropertyName("estado_cuenta")]
        public string estado_cuenta { get; set; } = null!;

        [JsonPropertyName("plan")]
        public MiPlanCuentaPlanDTO plan { get; set; } = new MiPlanCuentaPlanDTO();

        [JsonPropertyName("suscripcion")]
        public MiPlanCuentaSuscripcionDTO? suscripcion { get; set; }

        [JsonPropertyName("facturacion")]
        public MiPlanCuentaFacturacionDTO facturacion { get; set; } = new MiPlanCuentaFacturacionDTO();
    }

    public class MiPlanCuentaPlanDTO
    {
        [JsonPropertyName("id_plan")]
        public long? id_plan { get; set; }

        [JsonPropertyName("codigo")]
        public string? codigo { get; set; }

        [JsonPropertyName("nombre")]
        public string? nombre { get; set; }
    }

    public class MiPlanCuentaSuscripcionDTO
    {
        [JsonPropertyName("scope")]
        public string scope { get; set; } = null!;

        [JsonPropertyName("estado")]
        public string estado { get; set; } = null!;

        [JsonPropertyName("periodo")]
        public string? periodo { get; set; }

        [JsonPropertyName("current_period_start")]
        public DateTimeOffset? current_period_start { get; set; }

        [JsonPropertyName("current_period_end")]
        public DateTimeOffset? current_period_end { get; set; }

        [JsonPropertyName("dias_restantes")]
        public int? dias_restantes { get; set; }

        [JsonPropertyName("vencida")]
        public bool vencida { get; set; }

        [JsonPropertyName("auto_renueva")]
        public bool auto_renueva { get; set; }
    }

    public class MiPlanCuentaFacturacionDTO
    {
        [JsonPropertyName("pago_pendiente")]
        public bool pago_pendiente { get; set; }

        [JsonPropertyName("ultimo_pago_fecha")]
        public DateTimeOffset? ultimo_pago_fecha { get; set; }

        [JsonPropertyName("ultimo_pago_total")]
        public decimal? ultimo_pago_total { get; set; }

        [JsonPropertyName("moneda")]
        public string? moneda { get; set; }

        [JsonPropertyName("proximo_vencimiento")]
        public DateTimeOffset? proximo_vencimiento { get; set; }
    }
}