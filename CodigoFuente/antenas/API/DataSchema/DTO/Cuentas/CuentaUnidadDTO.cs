using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class CuentaUnidadDTO
    {
        [JsonPropertyName("id_unidad")]
        public long id_unidad { get; set; }

        [JsonPropertyName("codigo")]
        public string codigo { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        public string? descripcion { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }
    }

    public class CuentaUnidadCreateRequestDTO
    {
        [JsonPropertyName("codigo")]
        public string codigo { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        public string? descripcion { get; set; }
    }

    public class CuentaUnidadUpdateRequestDTO
    {
        [JsonPropertyName("id_unidad")]
        public long id_unidad { get; set; }

        [JsonPropertyName("codigo")]
        public string codigo { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        public string? descripcion { get; set; }

        [JsonPropertyName("activo")]
        public bool activo { get; set; }
    }
}