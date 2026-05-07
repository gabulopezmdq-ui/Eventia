using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaAlertasOperativasDTO
    {
        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("programa")]
        [JsonProperty("programa")]
        public string Programa { get; set; } = "";

        [JsonPropertyName("fecha")]
        [JsonProperty("fecha")]
        public DateOnly Fecha { get; set; }

        [JsonPropertyName("resumen")]
        [JsonProperty("resumen")]
        public ProgramaAlertasResumenDTO Resumen { get; set; } = new();

        [JsonPropertyName("alertas")]
        [JsonProperty("alertas")]
        public List<ProgramaAlertaOperativaItemDTO> Alertas { get; set; } = new();
    }

    public class ProgramaAlertasResumenDTO
    {
        [JsonPropertyName("total")]
        [JsonProperty("total")]
        public int Total { get; set; }

        [JsonPropertyName("altas")]
        [JsonProperty("altas")]
        public int Altas { get; set; }

        [JsonPropertyName("medias")]
        [JsonProperty("medias")]
        public int Medias { get; set; }

        [JsonPropertyName("bajas")]
        [JsonProperty("bajas")]
        public int Bajas { get; set; }

        [JsonPropertyName("salud")]
        [JsonProperty("salud")]
        public int Salud { get; set; }

        [JsonPropertyName("cocina")]
        [JsonProperty("cocina")]
        public int Cocina { get; set; }

        [JsonPropertyName("autorizaciones")]
        [JsonProperty("autorizaciones")]
        public int Autorizaciones { get; set; }

        [JsonPropertyName("seguimientos")]
        [JsonProperty("seguimientos")]
        public int Seguimientos { get; set; }
    }

    public class ProgramaAlertaOperativaItemDTO
    {
        [JsonPropertyName("nivel")]
        [JsonProperty("nivel")]
        public string Nivel { get; set; } = "";

        [JsonPropertyName("categoria")]
        [JsonProperty("categoria")]
        public string Categoria { get; set; } = "";

        [JsonPropertyName("titulo")]
        [JsonProperty("titulo")]
        public string Titulo { get; set; } = "";

        [JsonPropertyName("mensaje")]
        [JsonProperty("mensaje")]
        public string Mensaje { get; set; } = "";

        [JsonPropertyName("id_invitado")]
        [JsonProperty("id_invitado")]
        public long? IdInvitado { get; set; }

        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public string? Participante { get; set; }

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long? IdInscripcion { get; set; }

        [JsonPropertyName("accion_sugerida")]
        [JsonProperty("accion_sugerida")]
        public string? AccionSugerida { get; set; }

        [JsonPropertyName("endpoint_sugerido")]
        [JsonProperty("endpoint_sugerido")]
        public string? EndpointSugerido { get; set; }
    }
}