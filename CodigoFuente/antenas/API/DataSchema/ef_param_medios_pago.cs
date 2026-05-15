using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_medios_pago : IRegistroUnico
    {
        public short id_medio_pago { get; set; }

        public string codigo { get; set; } = null!;

        public bool activo { get; set; }
        public short orden { get; set; }

        public bool permite_referencia { get; set; }
        public bool es_internacional { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties =>
            new[] { "codigo" };
    }
}