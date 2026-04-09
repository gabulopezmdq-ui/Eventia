using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class ClienteDTO
    {
        [JsonPropertyName("id_cliente")]
        public long id_cliente { get; set; }

        [JsonPropertyName("nombre_cliente")]
        public string nombre_cliente { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("notas")]
        public string? notas { get; set; }

        [JsonPropertyName("id_unidad")]
        public long? id_unidad { get; set; }

        [JsonPropertyName("unidad_nombre")]
        public string? unidad_nombre { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }
    }

    public class ClienteCreateRequestDTO
    {
        [JsonPropertyName("nombre_cliente")]
        public string nombre_cliente { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("notas")]
        public string? notas { get; set; }

        [JsonPropertyName("id_unidad")]
        public long? id_unidad { get; set; }
    }

    public class ClienteUpdateRequestDTO
    {
        [JsonPropertyName("id_cliente")]
        public long id_cliente { get; set; }

        [JsonPropertyName("nombre_cliente")]
        public string nombre_cliente { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("notas")]
        public string? notas { get; set; }

        [JsonPropertyName("id_unidad")]
        public long? id_unidad { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }
    }
}
