using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaLinkPublicoResponse
    {
        [JsonPropertyName("ok")]
        public bool Ok { get; set; }

        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_acceso")]
        public long IdAcceso { get; set; }

        [JsonPropertyName("id_acceso_link")]
        public long IdAccesoLink { get; set; }

        [JsonPropertyName("token")]
        public string Token { get; set; } = null!;

        [JsonPropertyName("url_publica")]
        public string UrlPublica { get; set; } = null!;
    }
}