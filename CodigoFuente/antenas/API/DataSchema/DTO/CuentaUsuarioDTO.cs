using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class CuentaUsuarioDTO
    {
        [JsonPropertyName("id_usuario")]
        public long id_usuario { get; set; }
        public long id_cuenta_usuario { get; set; }

        [JsonPropertyName("nombre")]
        public string? nombre { get; set; }

        [JsonPropertyName("apellido")]
        public string? apellido { get; set; }

        [JsonPropertyName("email")]
        public string email { get; set; } = null!;

        [JsonPropertyName("rol_cuenta")]
        public string rol_cuenta { get; set; } = null!;

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset fecha_alta { get; set; }
    }
}
