namespace API.DataSchema.DTO
{
    public class PlanPublicoLimiteDTO
    {
        public string codigo_limite { get; set; } = null!;
        public int? valor_int { get; set; }
        public decimal? valor_numeric { get; set; }
        public string? valor_json { get; set; }
    }
}

