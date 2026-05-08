using Newtonsoft.Json;
using System.Collections.Generic;
using System.Text.Json.Serialization;

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

        [JsonPropertyName("qrs_retiro")]
        [JsonProperty("qrs_retiro")]
        public List<ProgramaInscripcionQrRetiroDTO> QrsRetiro { get; set; } = new();
    }

    public class ProgramaInscripcionQrRetiroDTO
    {
        [JsonPropertyName("nombre_autorizado")]
        [JsonProperty("nombre_autorizado")]
        public string NombreAutorizado { get; set; } = "";

        [JsonPropertyName("telefono_autorizado")]
        [JsonProperty("telefono_autorizado")]
        public string? TelefonoAutorizado { get; set; }

        [JsonPropertyName("relacion")]
        [JsonProperty("relacion")]
        public string? Relacion { get; set; }

        [JsonPropertyName("qr_token")]
        [JsonProperty("qr_token")]
        public string QrToken { get; set; } = "";

        [JsonPropertyName("participantes")]
        [JsonProperty("participantes")]
        public List<ProgramaInscripcionQrParticipanteDTO> Participantes { get; set; } = new();
    }

    public class ProgramaInscripcionQrParticipanteDTO
    {
        [JsonPropertyName("id_invitado")]
        [JsonProperty("id_invitado")]
        public long IdInvitado { get; set; }

        [JsonPropertyName("nombre_completo")]
        [JsonProperty("nombre_completo")]
        public string NombreCompleto { get; set; } = "";
    }
}