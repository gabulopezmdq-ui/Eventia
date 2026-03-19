using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_invitados 
    {
            public long id_invitado { get; set; }

            public long id_evento { get; set; }

            public string nombre { get; set; } = null!;
            public string apellido { get; set; } = null!;
            public string? sobrenombre { get; set; }

            public string? email { get; set; }
            public string? celular { get; set; }

            public string? rsvp_token { get; set; }


            /// <summary>
            /// P = Pendiente, Y = Yes, N = No
            /// </summary>
            public string rsvp_estado { get; set; } = "P";

            public string? rsvp_mensaje { get; set; }
            public DateTimeOffset? fecha_rsvp { get; set; }

            public DateTimeOffset fecha_alta { get; set; }

            public DateTimeOffset? fecha_modif { get; set; }

            public bool activo { get; set; } = true;

            public long? id_usuario_invitador { get; set; }

            public string? qr_token { get; set; }

            public long? id_acceso { get; set; }
            public long? id_rsvp_grupo { get; set; }

        public bool es_titular_grupo { get; set; }

       
        // Navigation
        public ef_eventos? evento { get; set; } = null!;
            public ef_evento_accesos? acceso { get; set; }
            public ef_usuarios? usuario_invitador { get; set; }
            public ef_rsvp_grupos? rsvp_grupo { get; set; }


    }
}
