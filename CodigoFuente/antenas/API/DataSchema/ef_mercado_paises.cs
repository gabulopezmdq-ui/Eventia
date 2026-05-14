using System;

namespace API.DataSchema
{
    public class ef_mercado_paises
    {
        public long id_mercado_pais { get; set; }
        public string codigo_mercado { get; set; } = null!;
        public short id_pais { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}