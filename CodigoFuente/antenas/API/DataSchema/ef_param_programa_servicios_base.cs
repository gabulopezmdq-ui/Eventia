using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_programa_servicios_base : IRegistroUnico
    {
        public long id_servicio_base { get; set; }

        public string codigo { get; set; } = null!;

        public int orden { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "codigo" };
    }
}