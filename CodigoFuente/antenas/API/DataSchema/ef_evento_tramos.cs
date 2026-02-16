using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_tramos
    {
        public long id_tramo { get; set; }
        public long id_evento { get; set; }
        public short? id_tramo_tipo { get; set; }

        public string nombre { get; set; }
        public string leyenda_visible { get; set; }
        public string? notas_internas { get; set; }

        public DateTimeOffset fecha_hora_inicio { get; set; }
        public DateTimeOffset? fecha_hora_fin { get; set; }

        public string? lugar { get; set; }
        public string? direccion { get; set; }
        public decimal? latitud { get; set; }
        public decimal? longitud { get; set; }

        public short orden { get; set; }
        public int? cupo { get; set; }
        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public ef_eventos? evento { get; set; }               // tabla existente
        public ef_tramo_tipos? tramo_tipo { get; set; }

        public ICollection<ef_evento_acceso_tramos>? acceso_tramos { get; set; } = new List<ef_evento_acceso_tramos>();
    }

}
