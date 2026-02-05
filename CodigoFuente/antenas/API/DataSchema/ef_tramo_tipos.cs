using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_tramo_tipos
    {
        public short id_tramo_tipo { get; set; }
        public string codigo { get; set; }
        public bool activo { get; set; }

        // Nav
        public ICollection<ef_evento_tramos> evento_tramos { get; set; } = new List<ef_evento_tramos>();
        public ICollection<ef_plantilla_tramos> plantilla_tramos { get; set; } = new List<ef_plantilla_tramos>();
    }
}
