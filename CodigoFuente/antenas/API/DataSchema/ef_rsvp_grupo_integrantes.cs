using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_rsvp_grupo_integrantes 
    {
        public long id_rsvp_grupo_integrante { get; set; }

        public long id_rsvp_grupo { get; set; }
        public long id_invitado { get; set; }

        /// <summary>
        /// T = Titular, A = Acompañante
        /// </summary>
        public string rol { get; set; } = null!;

        public int orden { get; set; } = 1;

        public long? id_evento_edad_rango { get; set; }

        public short? edad_anios { get; set; }

        public bool requiere_asistencia { get; set; } = false;

        public string? alimentacion_detalle { get; set; }

        /// <summary>
        /// A = Activo (default)
        /// </summary>
        public string rol_evento { get; set; } = "A";

        // Navigation properties
        public ef_rsvp_grupos rsvp_grupo { get; set; } = null!;
        public ef_invitados invitado { get; set; } = null!;
        public ef_evento_edad_rangos? evento_edad_rango { get; set; }
    }
}
