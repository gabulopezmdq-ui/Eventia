namespace API.DataSchema.DTO
{
    public class FeatureEfectivaDTO
    {
        public long id_feature { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string categoria { get; set; } = null!;
        public bool monetizable { get; set; }

        public string? config_default { get; set; }
        public string? config_plan_override { get; set; }
        public string? config_addon_override { get; set; }
        public string? config_evento_override { get; set; }
    }
}
