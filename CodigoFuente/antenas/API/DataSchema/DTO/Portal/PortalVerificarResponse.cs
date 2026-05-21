using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Portal
{
    public class PortalVerificarResponse
    {
        [JsonPropertyName("token")]
        [JsonProperty("token")]
        public string Token { get; set; } = string.Empty;
    }
}
