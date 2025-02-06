using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_POF_Antiguedades
    {
        public int IdPOFAntig { get; set; }
        public int IdPersona { get; set; }
        public int? MesReferencia { get; set; }
        public int? AnioReferencia { get; set; }
        public int? MesAntiguedad { get; set; }
        public int? AnioAntiguedad { get; set; }

        // Propiedades de navegación
        public string[] UniqueProperties => new[] { "IdPersona" };
        public virtual MEC_Personas? Persona { get; set; }
    }
}
