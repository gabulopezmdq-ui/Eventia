using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionAutorizadoRetiroRequest
    {
        [JsonPropertyName("nombre_autorizado")]
        [JsonProperty("nombre_autorizado")]
        public string? NombreAutorizado { get; set; } = null!;

        [JsonPropertyName("telefono_autorizado")]
        [JsonProperty("telefono_autorizado")]
        public string? TelefonoAutorizado { get; set; }

        [JsonPropertyName("id_relacion_persona")]
        [JsonProperty("id_relacion_persona")]
        public long? IdRelacionPersona { get; set; }

        [JsonPropertyName("observaciones")]
        [JsonProperty("observaciones")]
        public string? Observaciones { get; set; }
    }
}