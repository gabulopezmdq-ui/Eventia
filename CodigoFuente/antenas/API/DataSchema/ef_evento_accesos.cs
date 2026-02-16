using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_accesos
    {
        public long id_acceso { get; set; }
        public long id_evento { get; set; }

        public string nombre { get; set; }
        public string mensaje_rsvp { get; set; }

        public bool es_publico { get; set; }
        public int? cupo { get; set; }
        public decimal? precio { get; set; }

        public bool activo { get; set; }
        public short orden { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public ef_eventos? evento { get; set; }               // tabla existente
        public ICollection<ef_evento_acceso_tramos>? acceso_tramos { get; set; } = new List<ef_evento_acceso_tramos>();
        public ICollection<ef_invitados>? invitados { get; set; } = new List<ef_invitados>(); // existente (le agregamos id_acceso)
    }
}
