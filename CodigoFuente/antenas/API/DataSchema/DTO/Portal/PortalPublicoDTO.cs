using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Portal
{
    public class PortalLandingDTO
    {
        [JsonPropertyName("evento")]
        [JsonProperty("evento")]
        public PortalEventoDTO Evento { get; set; } = new();
    }

    public class PortalDashboardDTO
    {
        [JsonPropertyName("evento")]
        [JsonProperty("evento")]
        public PortalEventoDTO Evento { get; set; } = new();

        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public PortalParticipanteDTO Participante { get; set; } = new();

        [JsonPropertyName("secciones_habilitadas")]
        [JsonProperty("secciones_habilitadas")]
        public List<PortalSeccionDTO> SeccionesHabilitadas { get; set; } = new();
    }

    public class PortalEventoDTO
    {
        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [JsonPropertyName("fecha_inicio")]
        [JsonProperty("fecha_inicio")]
        public string FechaInicio { get; set; } = string.Empty;

        [JsonPropertyName("fecha_fin")]
        [JsonProperty("fecha_fin")]
        public string FechaFin { get; set; } = string.Empty;

        [JsonPropertyName("logo_url")]
        [JsonProperty("logo_url")]
        public string? LogoUrl { get; set; }

        [JsonPropertyName("estado")]
        [JsonProperty("estado")]
        public string Estado { get; set; } = string.Empty;
    }

    public class PortalParticipanteDTO
    {
        [JsonPropertyName("nombre_responsable")]
        [JsonProperty("nombre_responsable")]
        public string NombreResponsable { get; set; } = string.Empty;

        [JsonPropertyName("apellido_responsable")]
        [JsonProperty("apellido_responsable")]
        public string ApellidoResponsable { get; set; } = string.Empty;
    }

    public class PortalSeccionDTO
    {
        [JsonPropertyName("codigo")]
        [JsonProperty("codigo")]
        public string codigo { get; set; } = string.Empty;

        [JsonPropertyName("orden")]
        [JsonProperty("orden")]
        public int orden { get; set; }

        [JsonPropertyName("titulo")]
        [JsonProperty("titulo")]
        public string titulo { get; set; } = string.Empty;

        [JsonPropertyName("visible")]
        [JsonProperty("visible")]
        public bool visible { get; set; }

        [JsonPropertyName("requiere_desbloqueo")]
        [JsonProperty("requiere_desbloqueo")]
        public bool requiere_desbloqueo { get; set; }
    }
}
