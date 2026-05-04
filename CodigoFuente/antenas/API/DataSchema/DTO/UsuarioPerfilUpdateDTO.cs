using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class UsuarioPerfilUpdateDTO
    {
        [JsonPropertyName("Nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("Apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("Telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("Pais")]
        public string? pais_codigo { get; set; } // Viene "AR", "ES", etc.

        [JsonPropertyName("IdiomaPreferido")]
        public string? idioma_codigo { get; set; }

        [JsonPropertyName("RecibirNovedades")]
        public bool? recibir_novedades { get; set; }

        [JsonPropertyName("AvatarUrl")]
        public string? avatar_url { get; set; }
    }
}
