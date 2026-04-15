using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoCaptacionLinkUpsertRequest
    {
        [JsonPropertyName("id_acceso_link")]
        public long? id_acceso_link { get; set; }

        [JsonPropertyName("id_acceso")]
        public long id_acceso { get; set; }

        [JsonPropertyName("titulo")]
        public string titulo { get; set; } = null!;

        [JsonPropertyName("leyenda_publica")]
        public string? leyenda_publica { get; set; }

        [JsonPropertyName("max_personas_total")]
        public int max_personas_total { get; set; }

        [JsonPropertyName("max_adultos")]
        public int max_adultos { get; set; }

        [JsonPropertyName("fecha_expiracion")]
        public DateTimeOffset? fecha_expiracion { get; set; }

        [JsonPropertyName("requiere_nombres_acompanantes")]
        public bool requiere_nombres_acompanantes { get; set; }

        [JsonPropertyName("es_captacion_publica")]
        public bool es_captacion_publica { get; set; }

        [JsonPropertyName("requiere_registro")]
        public bool requiere_registro { get; set; }

        [JsonPropertyName("cupo_beneficio")]
        public int? cupo_beneficio { get; set; }

        [JsonPropertyName("id_tipo_beneficio_registro")]
        public long? id_tipo_beneficio_registro { get; set; }

        [JsonPropertyName("beneficio_titulo")]
        public string? beneficio_titulo { get; set; }

        [JsonPropertyName("beneficio_descripcion")]
        public string? beneficio_descripcion { get; set; }

        [JsonPropertyName("beneficio_hasta")]
        public DateTimeOffset? beneficio_hasta { get; set; }

        [JsonPropertyName("mostrar_disponibles")]
        public bool mostrar_disponibles { get; set; }

        [JsonPropertyName("mensaje_post_registro")]
        public string? mensaje_post_registro { get; set; }

        [JsonPropertyName("origen_default")]
        public string? origen_default { get; set; }

        [JsonPropertyName("permite_reutilizar_audiencia")]
        public bool permite_reutilizar_audiencia { get; set; } = true;

        [JsonPropertyName("activo")]
        public bool activo { get; set; } = true;
    }
}