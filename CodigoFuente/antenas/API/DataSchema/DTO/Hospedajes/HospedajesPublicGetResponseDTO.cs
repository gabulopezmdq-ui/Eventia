using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class HospedajesPublicGetResponseDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("visibilidad")]
        public string visibilidad { get; set; } = "PUBLICO";

        [JsonPropertyName("puede_ver")]
        public bool puede_ver { get; set; } = true;

        [JsonPropertyName("mensaje_bloqueo")]
        public string? mensaje_bloqueo { get; set; }

        [JsonPropertyName("mostrar_mapa")]
        public bool mostrar_mapa { get; set; } = true;

        [JsonPropertyName("items")]
        public List<HospedajeDTO> items { get; set; } = new List<HospedajeDTO>();
    }
}