using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionAutorizacionAceptadaDTO
    {
        [JsonPropertyName("id_inscripcion_autorizacion")]
        [JsonProperty("id_inscripcion_autorizacion")]
        public long IdInscripcionAutorizacion { get; set; }

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("id_rsvp_grupo_integrante")]
        [JsonProperty("id_rsvp_grupo_integrante")]
        public long? IdRsvpGrupoIntegrante { get; set; }

        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public string? Participante { get; set; }

        [JsonPropertyName("id_programa_autorizacion_config")]
        [JsonProperty("id_programa_autorizacion_config")]
        public long IdProgramaAutorizacionConfig { get; set; }

        [JsonPropertyName("codigo")]
        [JsonProperty("codigo")]
        public string Codigo { get; set; } = "";

        [JsonPropertyName("titulo")]
        [JsonProperty("titulo")]
        public string Titulo { get; set; } = "";

        [JsonPropertyName("texto_aceptado")]
        [JsonProperty("texto_aceptado")]
        public string TextoAceptado { get; set; } = "";

        [JsonPropertyName("aceptada")]
        [JsonProperty("aceptada")]
        public bool Aceptada { get; set; }

        [JsonPropertyName("fecha_aceptacion")]
        [JsonProperty("fecha_aceptacion")]
        public DateTimeOffset FechaAceptacion { get; set; }

        [JsonPropertyName("nombre_firmante")]
        [JsonProperty("nombre_firmante")]
        public string? NombreFirmante { get; set; }
    }

    public class ProgramaInscripcionAutorizacionesResponseDTO
    {
        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("responsable")]
        [JsonProperty("responsable")]
        public string Responsable { get; set; } = "";

        [JsonPropertyName("email")]
        [JsonProperty("email")]
        public string? Email { get; set; }

        [JsonPropertyName("telefono")]
        [JsonProperty("telefono")]
        public string? Telefono { get; set; }

        [JsonPropertyName("autorizaciones_grupo")]
        [JsonProperty("autorizaciones_grupo")]
        public List<ProgramaInscripcionAutorizacionAceptadaDTO> AutorizacionesGrupo { get; set; } = new();

        [JsonPropertyName("autorizaciones_participantes")]
        [JsonProperty("autorizaciones_participantes")]
        public List<ProgramaInscripcionAutorizacionAceptadaDTO> AutorizacionesParticipantes { get; set; } = new();
    }
}