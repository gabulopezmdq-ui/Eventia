public class AddonFeatureDTO
{
    public long id_feature { get; set; }
    public string codigo { get; set; } = string.Empty;
    public string nombre { get; set; } = string.Empty;
    public string? descripcion { get; set; }
    public string? categoria { get; set; }
    public bool monetizable { get; set; }
}