using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_clientes : IRegistroUnico
    {
        public long id_cliente { get; set; }

        public long id_cuenta { get; set; }

        public string nombre_cliente { get; set; } = null!;
        public string? email { get; set; }
        public string? telefono { get; set; }
        public string? notas { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public bool activo { get; set; }

        public string[] UniqueProperties => System.Array.Empty<string>();

        // Navegación
        public virtual ef_cuentas? cuenta { get; set; }
    }   
}
