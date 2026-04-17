using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_audiencias_personas : IRegistroUnico
    {
        public long id_audiencia_persona { get; set; }
        public long id_cuenta { get; set; }
        public string nombre { get; set; } = null!;
        public string apellido { get; set; } = null!;
        public string? email { get; set; }
        public string? celular { get; set; }
        public DateTime? fecha_nacimiento { get; set; }
        public string? instagram { get; set; }
        public string? zona { get; set; }
        public string? ciudad { get; set; }
        public bool acepta_comunicaciones { get; set; }
        public bool acepta_promociones { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_cuentas? cuenta { get; set; }
    }
}
