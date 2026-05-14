using System;

namespace API.DataSchema
{
    public class ef_mercados
    {
        public string codigo_mercado { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string codigo_moneda_default { get; set; } = null!;
        public bool activo { get; set; }
        public short orden { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}