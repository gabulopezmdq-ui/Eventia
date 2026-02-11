using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_plantilla_tramos
    {
        public long id_plantilla_tramo { get; set; }
        public short id_plantilla { get; set; }
        public short? id_tramo_tipo { get; set; }

        public string nombre_default { get; set; }
        public string leyenda_default { get; set; }

        public short orden { get; set; }
        public bool activo { get; set; }

        // Nav
        public ef_plantillas_evento? plantilla { get; set; }
        public ef_tramo_tipos? tramo_tipo { get; set; }

        public ICollection<ef_plantilla_acceso_tramos>? acceso_tramos { get; set; } = new List<ef_plantilla_acceso_tramos>();
    }
}
