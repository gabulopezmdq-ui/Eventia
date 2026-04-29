using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionConfirmarResponse
    {
        [JsonPropertyName("ok")]
        [JsonProperty("ok")]
        public bool Ok { get; set; }

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("id_rsvp_grupo")]
        [JsonProperty("id_rsvp_grupo")]
        public long IdRsvpGrupo { get; set; }

        [JsonPropertyName("token_consulta")]
        [JsonProperty("token_consulta")]
        public string TokenConsulta { get; set; } = null!;

        [JsonPropertyName("total_general")]
        [JsonProperty("total_general")]
        public decimal TotalGeneral { get; set; }

        [JsonPropertyName("mensaje")]
        [JsonProperty("mensaje")]
        public string Mensaje { get; set; } = "Inscripción confirmada correctamente.";
    }
}