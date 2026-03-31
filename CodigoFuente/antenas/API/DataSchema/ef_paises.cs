using System;

namespace API.DataSchema
{
    public class ef_paises
    {
        public short id_pais { get; set; }
        public string codigo_iso2 { get; set; }
        public string codigo_iso3 { get; set; }
        public bool activo { get; set; }
        public short orden { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}