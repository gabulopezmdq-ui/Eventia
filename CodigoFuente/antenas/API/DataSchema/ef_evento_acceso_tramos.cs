using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_acceso_tramos
    {
        public long id_acceso { get; set; }
        public long id_tramo { get; set; }

        // Nav
        public ef_evento_accesos? acceso { get; set; }
        public ef_evento_tramos? tramo { get; set; }
    }
}
