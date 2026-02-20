namespace API.DataSchema.DTO
{
    public class EventoAccesoUpdateRequestDTO
    {
        public string nombre { get; set; } = null!;
        public string? mensaje_rsvp { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; } = true;
    }
}
