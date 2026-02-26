using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_acceso_links
    {
        public long id_acceso_link { get; set; }

        public long id_acceso { get; set; }

        public string titulo { get; set; } = null!;
        public string? leyenda_publica { get; set; }

        public string token { get; set; } = null!;

        public int max_personas_total { get; set; }
        public int? max_adultos { get; set; }

        public bool activo { get; set; } = true;

        public DateTimeOffset? fecha_expiracion { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public long? id_usuario_creador { get; set; }

        // Navigation
        public ef_evento_accesos acceso { get; set; } = null!;
        public ef_usuarios? usuario_creador { get; set; }

        public ICollection<ef_rsvp_grupos> rsvp_grupos { get; set; }
            = new List<ef_rsvp_grupos>();
    }

}
