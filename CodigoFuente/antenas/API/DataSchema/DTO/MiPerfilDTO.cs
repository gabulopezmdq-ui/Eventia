using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class MiPerfilDTO
    {
        [JsonPropertyName("id_usuario")]
        public long id_usuario { get; set; }

        [JsonPropertyName("email")]
        public string email { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string? nombre { get; set; }

        [JsonPropertyName("apellido")]
        public string? apellido { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("id_pais")]
        public short? id_pais { get; set; }

        [JsonPropertyName("pais_nombre")]
        public string? pais_nombre { get; set; }

        [JsonPropertyName("id_idioma_preferido")]
        public short? id_idioma_preferido { get; set; }

        [JsonPropertyName("idioma_preferido_nombre")]
        public string? idioma_preferido_nombre { get; set; }

        [JsonPropertyName("id_idioma_default_evento")]
        public short? id_idioma_default_evento { get; set; }

        [JsonPropertyName("idioma_default_evento_nombre")]
        public string? idioma_default_evento_nombre { get; set; }

        [JsonPropertyName("recibir_novedades")]
        public bool recibir_novedades { get; set; }

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset? fecha_alta { get; set; }

        [JsonPropertyName("ultimo_acceso")]
        public DateTimeOffset? ultimo_acceso { get; set; }

        [JsonPropertyName("cantidad_eventos_propios")]
        public int cantidad_eventos_propios { get; set; }

        [JsonPropertyName("cantidad_eventos_compartidos")]
        public int cantidad_eventos_compartidos { get; set; }

        [JsonPropertyName("ultimo_evento_creado")]
        public string? ultimo_evento_creado { get; set; }
    }
}