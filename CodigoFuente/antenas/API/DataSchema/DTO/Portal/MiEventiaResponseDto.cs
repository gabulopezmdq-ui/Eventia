using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Portal
{
    public class MiEventiaResponseDto
    {
        [JsonProperty("persona")]
        [JsonPropertyName("persona")]
        public PersonaDto Persona { get; set; }

        [JsonProperty("items")]
        [JsonPropertyName("items")]
        public List<AccesoItemDto> Items { get; set; }
    }

    public class PersonaDto
    {
        [JsonProperty("id_portal_persona")]
        [JsonPropertyName("id_portal_persona")]
        public long IdPortalPersona { get; set; }

        [JsonProperty("nombre")]
        [JsonPropertyName("nombre")]
        public string Nombre { get; set; }

        [JsonProperty("email")]
        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonProperty("telefono")]
        [JsonPropertyName("telefono")]
        public string Telefono { get; set; }
    }

    public class AccesoItemDto
    {
        [JsonProperty("tipo")]
        [JsonPropertyName("tipo")]
        public string Tipo { get; set; }               // "PROGRAMA" o "EVENTO"

        [JsonProperty("id_evento")]
        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonProperty("id_inscripcion")]
        [JsonPropertyName("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonProperty("id_invitado")]
        [JsonPropertyName("id_invitado")]
        public long? IdInvitado { get; set; }

        [JsonProperty("token_consulta")]
        [JsonPropertyName("token_consulta")]
        public string TokenConsulta { get; set; }       // string (token de 32 chars) para compatibilidad

        [JsonProperty("titulo")]
        [JsonPropertyName("titulo")]
        public string Titulo { get; set; }

        [JsonProperty("estado")]
        [JsonPropertyName("estado")]
        public string Estado { get; set; }

        [JsonProperty("url_portal")]
        [JsonPropertyName("url_portal")]
        public string UrlPortal { get; set; }
    }
}

