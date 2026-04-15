using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoUpdateConfiguracionRequest
    {
        [JsonPropertyName("es_publico")]
        public bool EsPublico { get; set; }

        [JsonPropertyName("modo_acceso")]
        public string ModoAcceso { get; set; } = null!;

        [JsonPropertyName("modo_asistencia")]
        public string ModoAsistencia { get; set; } = null!;
    }
}