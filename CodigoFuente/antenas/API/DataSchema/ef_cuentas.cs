using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_cuentas
    {
        public long id_cuenta { get; set; }
        public string nombre_cuenta { get; set; }
        public string tipo { get; set; }
        public string estado { get; set; }
        public long? id_plan { get; set; }

        public string instagram { get; set; }
        public string web { get; set; }
        public string telefono { get; set; }
        public string ciudad { get; set; }
        public short id_pais { get; set; }
        public short? id_tipo_identificacion_fiscal { get; set; }
        public string identificacion_fiscal { get; set; }
        public string descripcion { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
        public string? moneda_default { get; set; }

        public virtual ef_planes plan { get; set; }
        public virtual ef_paises pais { get; set; }
        public virtual ef_tipos_identificacion_fiscal tipo_identificacion_fiscal { get; set; }
    }
}
