using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_intereses_evento_publico : IRegistroUnico
    {
        public long id_interes_evento_publico { get; set; }
        public string codigo { get; set; } = null!;
        public bool activo { get; set; }
        public int orden { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();
    }
}
