using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_addons : IRegistroUnico
    {
        public long id_addon { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }

        public string scope { get; set; } = null!; // EVENTO / CUENTA
        public bool activo { get; set; }

        public string? config_json_default { get; set; } // jsonb
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "codigo" };
    }
}
