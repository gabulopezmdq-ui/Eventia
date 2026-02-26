using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_edad_rangos
    {
        public long id_evento_edad_rango { get; set; }

        public long id_evento { get; set; }
        public long id_edad_rango { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;

        /// <summary>
        /// A = Adulto, N = Niño, B = Bebé
        /// </summary>
        public string categoria_base { get; set; } = null!;

        public short edad_min { get; set; }
        public short? edad_max { get; set; }

        public int orden { get; set; } = 1;

        public bool activo { get; set; } = true;

        // Navigation
        public ef_eventos evento { get; set; } = null!;
        public ef_param_edad_rangos edad_rango_param { get; set; } = null!;
    }
}
