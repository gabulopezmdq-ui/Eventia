namespace API.DataSchema.DTO
{
    public class PlanPublicoFeatureDTO
    {
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string categoria { get; set; } = null!;
        public string? descripcion { get; set; }
        public bool monetizable { get; set; }
    }
}