using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Portal
{
    public class PortalVerificarRequest
    {
        [JsonPropertyName("email")]
        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;
    }
}
