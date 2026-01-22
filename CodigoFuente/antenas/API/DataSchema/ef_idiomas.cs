using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_idiomas : IRegistroUnico
    {
        public short id_idioma { get; set; }

        public string codigo_idioma { get; set; } = null!;
        public string codigo_region { get; set; } = null!;
        public string locale { get; set; } = null!;
        public string nombre_largo { get; set; } = null!;
        public string bandera_iso2 { get; set; } = null!;
        public bool activo { get; set; }

        public string[] UniqueProperties => new[] { "locale" };

    }
}
