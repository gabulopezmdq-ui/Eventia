using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_preferencias_musicales : IRegistroUnico
    {
        public long id_preferencia_musical { get; set; }
        public string codigo { get; set; } = null!;
        public bool activo { get; set; }
        public int orden { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();
    }
}