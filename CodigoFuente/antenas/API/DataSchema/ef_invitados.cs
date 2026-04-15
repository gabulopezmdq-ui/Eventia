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
            public long? id_acceso_link { get; set; }
            public long? id_audiencia_persona { get; set; }


        public virtual ef_eventos? evento { get; set; }
        public virtual ef_evento_accesos? acceso { get; set; }
        public virtual ef_usuarios? usuario_invitador { get; set; }
        public virtual ef_rsvp_grupos? rsvp_grupo { get; set; }

        public virtual ef_evento_acceso_links? acceso_link { get; set; }



        // Álbum
        public virtual ICollection<ef_evento_album_fotos> album_fotos { get; set; } = new List<ef_evento_album_fotos>();
        public virtual ICollection<ef_evento_album_likes> album_likes { get; set; } = new List<ef_evento_album_likes>();
        public virtual ICollection<ef_evento_album_ranking_votos> album_votos { get; set; } = new List<ef_evento_album_ranking_votos>();
    }
}
