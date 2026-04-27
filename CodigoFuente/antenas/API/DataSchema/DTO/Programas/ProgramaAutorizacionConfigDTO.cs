using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaAutorizacionConfigDTO
    {
        [JsonPropertyName("id_programa_autorizacion_config")]
        [JsonProperty("id_programa_autorizacion_config")]
        public long? IdProgramaAutorizacionConfig { get; set; }

        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_autorizacion_base")]
        [JsonProperty("id_autorizacion_base")]
        public long? IdAutorizacionBase { get; set; }

        [JsonPropertyName("codigo")]
        [JsonProperty("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("titulo")]
        [JsonProperty("titulo")]
        public string? Titulo { get; set; }

        [JsonPropertyName("texto")]
        [JsonProperty("texto")]
        public string? Texto { get; set; }

        [JsonPropertyName("titulo_override")]
        [JsonProperty("titulo_override")]
        public string? TituloOverride { get; set; }

        [JsonPropertyName("texto_override")]
        [JsonProperty("texto_override")]
        public string? TextoOverride { get; set; }

        [JsonPropertyName("obligatoria")]
        [JsonProperty("obligatoria")]
        public bool Obligatoria { get; set; } = true;

        [JsonPropertyName("requiere_aceptacion")]
        [JsonProperty("requiere_aceptacion")]
        public bool RequiereAceptacion { get; set; } = true;

        [JsonPropertyName("requiere_datos_responsable")]
        [JsonProperty("requiere_datos_responsable")]
        public bool RequiereDatosResponsable { get; set; } = true;

        [JsonPropertyName("orden")]
        [JsonProperty("orden")]
        public int Orden { get; set; }

        [JsonPropertyName("activo")]
        [JsonProperty("activo")]
        public bool Activo { get; set; } = true;
    }
}
