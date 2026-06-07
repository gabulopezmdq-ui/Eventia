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

    public bool incluida_en_plan { get; set; }

    public bool incluida_por_addon { get; set; }
    public bool incluida_por_addon_evento { get; set; }
    public bool incluida_por_addon_cuenta { get; set; }

    public bool? activo_evento { get; set; }
    public bool activo_resuelto { get; set; }

    public bool disponible { get; set; }
    public bool editable { get; set; }

    public string? origen { get; set; }
    public string? motivo_inactivo { get; set; }
    public string? mensaje_ui { get; set; }

    public bool visible_acceso { get; set; }
    public bool visible_centro { get; set; }

    public bool permite_acceso { get; set; }
    public bool permite_centro { get; set; }
}