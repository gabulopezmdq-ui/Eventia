using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_tipos_beneficio_registro : IRegistroUnico
    {
        public long id_tipo_beneficio_registro { get; set; }
        public string codigo { get; set; } = null!;
        public bool activo { get; set; }
        public int orden { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();
    }
}
