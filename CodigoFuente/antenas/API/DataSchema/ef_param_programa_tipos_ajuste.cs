using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_programa_tipos_ajuste : IRegistroUnico
    {
        public short id_tipo_ajuste { get; set; }

        public string codigo { get; set; } = null!;

        public bool activo { get; set; }

        public short orden { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "codigo" };
    }
}