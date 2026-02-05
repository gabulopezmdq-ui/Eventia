using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_plantilla_acceso_tramos
    {
        public long id_plantilla_acceso { get; set; }
        public long id_plantilla_tramo { get; set; }

        // Nav
        public ef_plantilla_accesos plantilla_acceso { get; set; }
        public ef_plantilla_tramos plantilla_tramo { get; set; }
    }
}
