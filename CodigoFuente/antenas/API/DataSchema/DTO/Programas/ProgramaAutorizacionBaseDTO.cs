using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaAutorizacionBaseDTO
    {
        [JsonPropertyName("id_autorizacion_base")]
        [JsonProperty("id_autorizacion_base")]
        public long IdAutorizacionBase { get; set; }

        [JsonPropertyName("codigo")]
        [JsonProperty("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("titulo")]
        [JsonProperty("titulo")]
        public string Titulo { get; set; } = null!;

        [JsonPropertyName("texto")]
        [JsonProperty("texto")]
        public string? Texto { get; set; }

        [JsonPropertyName("orden")]
        [JsonProperty("orden")]
        public int Orden { get; set; }
    }
}