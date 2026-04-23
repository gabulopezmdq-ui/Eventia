using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    // -------------------------
    // Solicitar contratación
    // -------------------------
    public class AddonSolicitudRequestDTO
    {
        [JsonPropertyName("id_addon")]
        public long id_addon { get; set; }

        // Opcionales (para sugerir precio/moneda en admin)
        [JsonPropertyName("mercado")]
        public string? mercado { get; set; }

        [JsonPropertyName("moneda")]
        public string? moneda { get; set; }
    }

    public class AddonSolicitudResponseDTO
    {
        public bool ok { get; set; }
        public long id_scope_addon { get; set; }
        public string estado { get; set; } = null!;
    }

    // -------------------------
    // "Mis add-ons" (evento/cuenta)
    // -------------------------
    public class AddonContratadoDTO
    {
        public long id_scope_addon { get; set; }
        public long id_addon { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string estado { get; set; } = null!;

        public bool activo { get; set; }
        public DateTimeOffset fecha_desde { get; set; }
        public DateTimeOffset? fecha_hasta { get; set; }

        public string? config_override { get; set; }
    }

    // -------------------------
    // Admin: pendientes
    // -------------------------
    public class AdminAddonPendienteItemDTO
    {
        public long id_scope_addon { get; set; }
        public string scope { get; set; } = null!; // EVENTO | CUENTA

        public long? id_evento { get; set; }
        public long? id_cuenta { get; set; }

        public string? addon_codigo { get; set; }
        public string? addon_nombre { get; set; }

        public string? evento_anfitriones { get; set; }
        public string? tipo_evento_codigo { get; set; }
        public string? cuenta_nombre { get; set; }

        public string estado { get; set; } = null!;
        public DateTimeOffset fecha_solicitud { get; set; }

        public string? mercado { get; set; }
        public string? moneda { get; set; }
        public decimal? importe_sugerido { get; set; }

        public bool inconsistente { get; set; }
        public string? detalle { get; set; }
    }

    // -------------------------
    // Admin: registrar pago manual + activar
    // -------------------------
    public class AdminRegistrarAddonPagoRequestDTO
    {
        [JsonPropertyName("id_scope_addon")]
        public long id_scope_addon { get; set; }

        [JsonPropertyName("moneda")]
        public string moneda { get; set; } = "ARS";

        [JsonPropertyName("importe")]
        public decimal importe { get; set; }

        [JsonPropertyName("concepto")]
        public string? concepto { get; set; }
    }
}