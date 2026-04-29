using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoUpdateConfiguracionRequest
    {
        [JsonProperty("es_publico")]
        [JsonPropertyName("es_publico")]
        public bool EsPublico { get; set; }

        [JsonProperty("modo_acceso")]
        [JsonPropertyName("modo_acceso")]
        public string ModoAcceso { get; set; } = null!;

        [JsonProperty("modo_asistencia")]
        [JsonPropertyName("modo_asistencia")]
        public string ModoAsistencia { get; set; } = null!;

        [JsonProperty("info_publica")]
        [JsonPropertyName("info_publica")]
        public string? InfoPublica { get; set; }
    }
}