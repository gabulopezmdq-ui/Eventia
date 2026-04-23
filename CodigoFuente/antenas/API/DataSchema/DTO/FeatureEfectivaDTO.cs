namespace API.DataSchema.DTO
{
    public class FeatureEfectivaDTO
    {
        public long id_feature { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? categoria { get; set; }
        public bool monetizable { get; set; }

        public string? config_default { get; set; }
        public string? config_plan_override { get; set; }
        public string? config_addon_override { get; set; }
        public string? config_evento_override { get; set; }

        // NUEVO
        public bool incluida_en_plan { get; set; }
        public bool incluida_por_addon { get; set; }

        // null = nunca se guardó en ef_evento_features
        public bool? activo_evento { get; set; }

        // lo que realmente puede usar el front
        public bool activo_resuelto { get; set; }

        // null | NO_INCLUIDA | DESACTIVADA_EN_EVENTO
        public string? motivo_inactivo { get; set; }
    }
}