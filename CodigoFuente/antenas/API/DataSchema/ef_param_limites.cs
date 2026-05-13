using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_limites : IRegistroUnico
    {
        public long id_limite { get; set; }
        public string codigo_limite { get; set; } = null!;
        public string tipo_valor { get; set; } = "INT";
        public string scope { get; set; } = "EVENTO";
        public bool mostrar_publico { get; set; } = true;
        public int orden { get; set; } = 0;
        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "codigo_limite" };
    }
}