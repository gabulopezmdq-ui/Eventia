using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_programa_tipos_campo_extra : IRegistroUnico
    {
        public long id_tipo_campo_extra { get; set; }
        public string codigo { get; set; } = null!;
        public int orden { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "codigo" };
    }
}