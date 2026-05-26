namespace API.DataSchema.DTO.Regalos
{
    public class RegalosFondoUpdateMetaDTO
    {
        public string titulo { get; set; } = null!;
        public string? descripcion { get; set; }
        public decimal objetivo_monto { get; set; }
        public short orden { get; set; }
        public bool visible { get; set; }
        public string? url_referencia { get; set; }
        public string? imagen_url { get; set; }
    }
}