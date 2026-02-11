using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_plantillas_evento
    {
        public short id_plantilla { get; set; }
        public string codigo { get; set; }
        public bool activo { get; set; }
        public int? id_tipo_evento { get; set; }

        // Nav
        public ICollection<ef_plantilla_tramos>? tramos { get; set; } = new List<ef_plantilla_tramos>();
        public ICollection<ef_plantilla_accesos>? accesos { get; set; } = new List<ef_plantilla_accesos>();
        public ef_tipos_evento? tipo_evento { get; set; }
    }
}
