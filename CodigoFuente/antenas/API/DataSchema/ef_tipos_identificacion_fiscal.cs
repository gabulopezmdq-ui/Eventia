using System;

namespace API.DataSchema
{
    public class ef_tipos_identificacion_fiscal
    {
        public short id_tipo_identificacion_fiscal { get; set; }
        public string codigo { get; set; }
        public short id_pais { get; set; }
        public bool activo { get; set; }
        public short orden { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public virtual ef_paises pais { get; set; }
    }
}
