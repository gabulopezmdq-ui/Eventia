using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_perfiles_asistencia : IRegistroUnico
    {
        public long id_perfil_asistencia { get; set; }
        public string codigo { get; set; } = null!;
        public bool activo { get; set; }
        public int orden { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();
    }
}
