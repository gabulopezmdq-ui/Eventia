using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionAutorizadoRetiroRequest
    {
        [JsonPropertyName("nombre_autorizado")]
        [JsonProperty("nombre_autorizado")]
        public string NombreAutorizado { get; set; } = null!;

        [JsonPropertyName("telefono_autorizado")]
        [JsonProperty("telefono_autorizado")]
        public string? TelefonoAutorizado { get; set; }

        [JsonPropertyName("relacion")]
        [JsonProperty("relacion")]
        public string? Relacion { get; set; }

        [JsonPropertyName("observaciones")]
        [JsonProperty("observaciones")]
        public string? Observaciones { get; set; }
    }
}