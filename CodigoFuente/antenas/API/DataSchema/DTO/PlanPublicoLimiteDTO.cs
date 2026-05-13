using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class PlanPublicoLimiteDTO
    {
        [JsonPropertyName("codigo_limite")]
        public string codigo_limite { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string? nombre { get; set; }

        [JsonPropertyName("descripcion")]
        public string? descripcion { get; set; }

        [JsonPropertyName("orden")]
        public int? orden { get; set; }

        [JsonPropertyName("valor_int")]
        public int? valor_int { get; set; }

        [JsonPropertyName("valor_numeric")]
        public decimal? valor_numeric { get; set; }

        [JsonPropertyName("valor_json")]
        public string? valor_json { get; set; }
    }
}