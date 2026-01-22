using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_eventos : IRegistroUnico
    {
        public long id_evento { get; set; }

        public short id_tipo_evento { get; set; }
        public short id_idioma { get; set; }
        public long? id_cliente { get; set; }

        public string anfitriones_texto { get; set; } = null!;

        public DateTimeOffset fecha_hora { get; set; }

        public string? lugar { get; set; }
        public string? direccion { get; set; }

        public decimal? latitud { get; set; }     // numeric(9,6)
        public decimal? longitud { get; set; }    // numeric(9,6)

        public short? id_dress_code { get; set; }
        public string? dress_code_descripcion { get; set; }

        public string? saludo { get; set; }
        public string? mensaje_bienvenida { get; set; }
        public string? notas { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string estado { get; set; } = null!; // char(1) en BD

        public string[] UniqueProperties => System.Array.Empty<string>();

        // Navegaciones 
        public virtual ef_tipos_evento? tipo_evento { get; set; }
        public virtual ef_idiomas? idioma { get; set; }
        public virtual ef_dress_code? dress_code { get; set; }
        public virtual ef_clientes? cliente { get; set; } 
    }   
}
