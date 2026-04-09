using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_cuenta_unidades : IRegistroUnico
    {
        public long id_unidad { get; set; }
        public long id_cuenta { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_cuenta", "codigo" };

        // Navegaciones
        public virtual ef_cuentas? cuenta { get; set; }
    }
}