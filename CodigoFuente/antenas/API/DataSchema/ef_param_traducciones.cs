using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_param_traducciones 
    {
        public long id_param_traduccion { get; set; }

        public string entidad { get; set; } = null!;      // 'TIPO_EVENTO' / 'DRESS_CODE'
        public long id_item { get; set; }                 // id_tipo_evento o id_dress_code
        public short id_idioma { get; set; }              // FK ef_idiomas

        public string texto { get; set; } = null!;
        public short? orden { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        // Navegacion
        public ef_idiomas? idioma { get; set; }
    }   
}
