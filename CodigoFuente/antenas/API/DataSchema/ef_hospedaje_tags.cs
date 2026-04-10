namespace API.DataSchema
{
    public class ef_hospedaje_tags
    {
        public short id_hospedaje_tag { get; set; }
        public string codigo { get; set; } = null!;
        public bool activo { get; set; } = true;
        public short orden { get; set; } = 1;
    }
}