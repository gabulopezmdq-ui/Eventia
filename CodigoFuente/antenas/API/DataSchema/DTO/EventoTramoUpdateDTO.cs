using System;

namespace API.DataSchema.DTO
{
    public class EventoTramoUpdateRequest
    {
        public string nombre { get; set; } = null!;
        public string? leyenda_visible { get; set; }
        public DateTimeOffset fecha_hora_inicio { get; set; }
        public DateTimeOffset? fecha_hora_fin { get; set; }
        public string? lugar { get; set; }
        public string? direccion { get; set; }
        public decimal? latitud { get; set; }
        public decimal? longitud { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; } = true;
    }
}