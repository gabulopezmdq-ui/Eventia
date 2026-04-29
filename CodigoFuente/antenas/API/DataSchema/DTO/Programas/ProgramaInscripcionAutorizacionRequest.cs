using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionAutorizacionRequest
    {
        [JsonPropertyName("id_programa_autorizacion_config")]
        [JsonProperty("id_programa_autorizacion_config")]
        public long IdProgramaAutorizacionConfig { get; set; }

        [JsonPropertyName("aceptada")]
        [JsonProperty("aceptada")]
        public bool Aceptada { get; set; }
    }
}