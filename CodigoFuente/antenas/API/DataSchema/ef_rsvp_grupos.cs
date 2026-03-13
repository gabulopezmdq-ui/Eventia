using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_rsvp_grupos
    {
        public long id_rsvp_grupo { get; set; }

        public long id_evento { get; set; }
        public long id_acceso { get; set; }
        public long? id_acceso_link { get; set; }

        public int max_personas_total { get; set; }
        public int? max_adultos { get; set; }

        public int cantidad_total { get; set; }

        /// <summary>
        /// P = Pendiente, Y = Yes, N = No
        /// </summary>
        public string rsvp_estado { get; set; } = "P";

        public string? rsvp_mensaje { get; set; }

        public DateTimeOffset? fecha_rsvp { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public bool activo { get; set; } = true;

        public string nombre_grupo { get; set; }
        public int? cant_adultos_sin_nombre { get; set; }
        public int? cant_menores_sin_nombre { get; set; }

        // Navigation
        public ef_eventos evento { get; set; } = null!;
        public ef_evento_accesos acceso { get; set; } = null!;
        public ef_evento_acceso_links acceso_link { get; set; } = null!;

        public ICollection<ef_rsvp_grupo_integrantes> integrantes { get; set; }
            = new List<ef_rsvp_grupo_integrantes>();


    }
}
