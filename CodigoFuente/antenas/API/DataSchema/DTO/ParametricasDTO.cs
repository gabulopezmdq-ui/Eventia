using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class ParametricaDTO
    {
        [JsonPropertyName("id_item")]
        public long Id { get; set; }

        [JsonPropertyName("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("texto")]
        public string Texto { get; set; } = null!;

        [JsonPropertyName("orden")]
        public int? Orden { get; set; }
    }
}
