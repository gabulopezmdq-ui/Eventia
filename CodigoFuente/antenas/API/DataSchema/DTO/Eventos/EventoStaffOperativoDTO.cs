using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Eventos
{
    public class EventoStaffOperativoDTO
    {
        [JsonPropertyName("id_staff")]
        public long id_staff { get; set; }

        [JsonPropertyName("id_evento")]
        public long? id_evento { get; set; }

        [JsonPropertyName("id_cuenta")]
        public long? id_cuenta { get; set; }

        [JsonPropertyName("nombre")]
        public string? nombre { get; set; }

        [JsonPropertyName("apellido")]
        public string? apellido { get; set; }

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("id_rol")]
        public short id_rol { get; set; }

        [JsonPropertyName("codigo_rol")]
        public string codigo_rol { get; set; } = null!;

        [JsonPropertyName("rol_texto")]
        public string rol_texto { get; set; } = null!;

        [JsonPropertyName("codigo_acceso")]
        public string codigo_acceso { get; set; } = null!;

        [JsonPropertyName("pantalla_inicio")]
        public string? pantalla_inicio { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }

        [JsonPropertyName("fecha_uso")]
        public DateTimeOffset? fecha_uso { get; set; }

        [JsonPropertyName("usos")]
        public int usos { get; set; }

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset fecha_alta { get; set; }
    }

    public class AddEventoStaffOperativoRequest
    {
        [JsonPropertyName("nombre")]
        public string? nombre { get; set; }

        [JsonPropertyName("apellido")]
        public string? apellido { get; set; }

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("id_rol")]
        public short id_rol { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }
    }

    public class UpdateEventoStaffOperativoRequest
    {
        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("email")]
        public string? email { get; set; }
    }
}