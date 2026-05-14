using System;

namespace API.DataSchema
{
    public class ef_monedas
    {
        public string codigo_moneda { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? simbolo { get; set; }
        public bool activo { get; set; }
        public short orden { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}