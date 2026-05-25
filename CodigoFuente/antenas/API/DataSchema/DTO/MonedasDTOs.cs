namespace API.DataSchema.DTO
{
    public class MonedaComboDTO
    {
        public string codigo_moneda { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? simbolo { get; set; }
        public short orden { get; set; }
    }
}