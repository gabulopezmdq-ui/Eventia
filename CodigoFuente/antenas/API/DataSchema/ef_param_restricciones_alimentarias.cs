using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_param_restricciones_alimentarias
    {
        public long id_restriccion_alim { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public int orden { get; set; }
        public bool activo { get; set; }

        public bool es_alergia { get; set; }
        public short severidad { get; set; }
        public bool requiere_alerta { get; set; }
        public string? etiqueta_corta { get; set; }
    }
}
