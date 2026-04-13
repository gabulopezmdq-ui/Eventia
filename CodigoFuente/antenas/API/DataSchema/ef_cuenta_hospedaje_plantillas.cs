using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_cuenta_hospedaje_plantillas
    {
        public long id_hospedaje_plantilla { get; set; }
        public long id_cuenta { get; set; }
        public long? id_unidad { get; set; }

        public string? codigo { get; set; }
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }

        public string? ciudad { get; set; }
        public string? zona { get; set; }
        public short? id_pais { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public List<ef_cuenta_hospedaje_plantilla_items> items { get; set; } = new List<ef_cuenta_hospedaje_plantilla_items>();
    }
}