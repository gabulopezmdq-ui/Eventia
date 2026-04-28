using Newtonsoft.Json;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaAutorizacionConfigTraduccionDTO
    {
        [JsonPropertyName("id_idioma")]
        [JsonProperty("id_idioma")]
        public short IdIdioma { get; set; }

        [JsonPropertyName("locale")]
        [JsonProperty("locale")]
        public string? Locale { get; set; }

        [JsonPropertyName("nombre_largo")]
        [JsonProperty("nombre_largo")]
        public string? NombreLargo { get; set; }

        [JsonPropertyName("titulo")]
        [JsonProperty("titulo")]
        public string? Titulo { get; set; }

        [JsonPropertyName("texto")]
        [JsonProperty("texto")]
        public string? Texto { get; set; }

        [JsonPropertyName("activo")]
        [JsonProperty("activo")]
        public bool Activo { get; set; } = true;
    }

    public class ProgramaAutorizacionConfigTraduccionesRequest
    {
        [JsonPropertyName("items")]
        [JsonProperty("items")]
        public List<ProgramaAutorizacionConfigTraduccionDTO> Items { get; set; } = new();
    }
}