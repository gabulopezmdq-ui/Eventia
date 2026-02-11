using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_plantilla_accesos
    {
        public long id_plantilla_acceso { get; set; }
        public short id_plantilla { get; set; }

        public string nombre_default { get; set; }
        public string mensaje_rsvp_default { get; set; }
        public bool es_publico_default { get; set; }

        public short orden { get; set; }
        public bool es_default { get; set; }
        public bool activo { get; set; }

        // Nav
        public ef_plantillas_evento? plantilla { get; set; }
        public ICollection<ef_plantilla_acceso_tramos>? acceso_tramos { get; set; } = new List<ef_plantilla_acceso_tramos>();
    }
}
