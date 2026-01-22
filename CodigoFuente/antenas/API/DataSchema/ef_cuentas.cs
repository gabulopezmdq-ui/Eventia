using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_cuentas : IRegistroUnico
    {
        public long id_cuenta { get; set; }

        public string nombre_cuenta { get; set; } = null!;
        public string tipo { get; set; } = null!;

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "nombre_cuenta" };

        // Navegaciones
        public virtual ICollection<ef_clientes> clientes { get; set; }
            = new List<ef_clientes>();
    }   
}
