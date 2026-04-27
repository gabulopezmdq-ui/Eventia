using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_cliente_unidades : IRegistroUnico
    {
        public long id_cliente_unidad { get; set; }
        public long id_cliente { get; set; }
        public long id_unidad { get; set; }
        public bool es_principal { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_clientes? cliente { get; set; }
        public virtual ef_cuenta_unidades? unidad { get; set; }
    }
}
