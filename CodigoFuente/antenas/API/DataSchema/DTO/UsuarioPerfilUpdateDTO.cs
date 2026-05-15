using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class UsuarioPerfilUpdateDTO
    {
        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("id_pais")]
        public short? id_pais { get; set; }

        [JsonPropertyName("id_idioma_preferido")]
        public short? id_idioma_preferido { get; set; }

        [JsonPropertyName("id_idioma_default_evento")]
        public short? id_idioma_default_evento { get; set; }

        [JsonPropertyName("recibir_novedades")]
        public bool? recibir_novedades { get; set; }

        [JsonPropertyName("avatar_url")]
        public string? avatar_url { get; set; }
    }
}
