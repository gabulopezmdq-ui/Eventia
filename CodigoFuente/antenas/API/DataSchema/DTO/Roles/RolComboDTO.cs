using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Roles
{
    public class RolComboDTO
    {
        [JsonPropertyName("id_rol")]
        public short id_rol { get; set; }

        [JsonPropertyName("codigo")]
        public string codigo { get; set; } = null!;

        [JsonPropertyName("texto")]
        public string texto { get; set; } = null!;

        [JsonPropertyName("categoria")]
        public string categoria { get; set; } = null!;

        [JsonPropertyName("aplica_tipo_operacion")]
        public string aplica_tipo_operacion { get; set; } = null!;

        [JsonPropertyName("requiere_usuario")]
        public bool requiere_usuario { get; set; }

        [JsonPropertyName("permite_codigo_staff")]
        public bool permite_codigo_staff { get; set; }

        [JsonPropertyName("pantalla_inicio")]
        public string? pantalla_inicio { get; set; }

        [JsonPropertyName("orden_ui")]
        public int orden_ui { get; set; }
    }
}