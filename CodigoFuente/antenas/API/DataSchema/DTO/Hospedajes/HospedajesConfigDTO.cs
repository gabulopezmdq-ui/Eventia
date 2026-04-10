using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class HospedajesConfigDTO
    {
        [JsonPropertyName("mostrar_en_invitacion")]
        public bool mostrar_en_invitacion { get; set; } = true;

        [JsonPropertyName("visibilidad")]
        public string visibilidad { get; set; } = "PUBLICO"; // PUBLICO | SOLO_CONFIRMADOS

        [JsonPropertyName("mostrar_mapa")]
        public bool mostrar_mapa { get; set; } = true;

        [JsonPropertyName("permitir_guia")]
        public bool permitir_guia { get; set; } = true;
    }
}