using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_cuenta_usuarios : IRegistroUnico
    {
        public long id_cuenta_usuario { get; set; }

        public long id_cuenta { get; set; }
        public long id_usuario { get; set; }
        public short id_rol { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }

        public string[] UniqueProperties => new[] { "id_cuenta", "id_usuario", "id_rol" };

        // Navegaciones
        public virtual ef_cuentas? cuenta { get; set; }
        public virtual ef_usuarios? usuario { get; set; }
        public virtual ef_roles? rol { get; set; }
    }   
}
