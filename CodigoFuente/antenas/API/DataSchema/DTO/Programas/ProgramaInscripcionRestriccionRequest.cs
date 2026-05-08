using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionRestriccionRequest
    {
        [JsonPropertyName("id_restriccion_alimentaria")]
        [JsonProperty("id_restriccion_alimentaria")]
        public long IdRestriccionAlimentaria { get; set; }

        [JsonPropertyName("observacion")]
        [JsonProperty("observacion")]
        public string? Observacion { get; set; }

        [JsonPropertyName("severidad")]
        [JsonProperty("severidad")]
        public string? Severidad { get; set; }
    }
}