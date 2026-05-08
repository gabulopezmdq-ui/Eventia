using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionConfirmarRequest
    {
        [JsonPropertyName("id_idioma")]
        [JsonProperty("id_idioma")]
        public short? IdIdioma { get; set; }

        [JsonPropertyName("responsable")]
        [JsonProperty("responsable")]
        public ProgramaInscripcionResponsableRequest Responsable { get; set; } = new();

        [JsonPropertyName("participantes")]
        [JsonProperty("participantes")]
        public List<ProgramaInscripcionParticipanteRequest> Participantes { get; set; } = new();

        [JsonPropertyName("autorizaciones_grupo")]
        [JsonProperty("autorizaciones_grupo")]
        public List<ProgramaInscripcionAutorizacionRequest> AutorizacionesGrupo { get; set; } = new();

        [JsonPropertyName("firma")]
        [JsonProperty("firma")]
        public ProgramaInscripcionFirmaRequest? Firma { get; set; }
    }

    public class ProgramaInscripcionResponsableRequest
    {
        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        [JsonProperty("apellido")]
        public string Apellido { get; set; } = null!;

        [JsonPropertyName("email")]
        [JsonProperty("email")]
        public string? Email { get; set; }

        [JsonPropertyName("telefono")]
        [JsonProperty("telefono")]
        public string? Telefono { get; set; }

        [JsonPropertyName("documento")]
        [JsonProperty("documento")]
        public string? Documento { get; set; }

        [JsonPropertyName("relacion")]
        [JsonProperty("relacion")]
        public string? Relacion { get; set; }

        [JsonPropertyName("acepta_comunicaciones")]
        [JsonProperty("acepta_comunicaciones")]
        public bool AceptaComunicaciones { get; set; }

        [JsonPropertyName("acepta_promociones")]
        [JsonProperty("acepta_promociones")]
        public bool AceptaPromociones { get; set; }
    }

    public class ProgramaInscripcionFirmaRequest
    {
        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string? Nombre { get; set; }

        [JsonPropertyName("fecha")]
        [JsonProperty("fecha")]
        public DateOnly? Fecha { get; set; }
    }
}