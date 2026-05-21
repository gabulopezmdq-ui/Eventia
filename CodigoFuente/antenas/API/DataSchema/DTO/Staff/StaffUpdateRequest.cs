using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Staff
{
    public class StaffUpdateRequest
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
        public short? id_rol { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }

        [JsonPropertyName("activo")]
        public bool? activo { get; set; }
    }
}