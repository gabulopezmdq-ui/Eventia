using System;

namespace API.DataSchema.DTO
{
    public class EventoEstadoHistDTO
    {
        public DateTimeOffset Fecha { get; set; }
        public string Estado { get; set; } = null!;
        public string EstadoDescripcion { get; set; } = null!;
        public string? Usuario { get; set; }
        public string? Observaciones { get; set; }
    }
}