using System;

namespace API.DataSchema
{
    public class ef_evento_live_premios
    {
        public long id_premio { get; set; }
        public long id_dinamica { get; set; }
        public string titulo { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string modo_premio { get; set; } = string.Empty;
        public int? cantidad_ganadores { get; set; }
        public string? instrucciones_entrega { get; set; }
        public string? sponsor_nombre { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}