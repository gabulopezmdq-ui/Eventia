using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_acceso_links
    {
        public long id_acceso_link { get; set; }

        public long id_acceso { get; set; }
        public long id_evento { get; set; }
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
        public bool requiere_nombres_acompanantes { get; set; } = false;

        // NUEVO - captación pública
        public bool es_captacion_publica { get; set; }
        public bool requiere_registro { get; set; }
        public int? cupo_beneficio { get; set; }
        public long? id_tipo_beneficio_registro { get; set; }
        public string? beneficio_titulo { get; set; }
        public string? beneficio_descripcion { get; set; }
        public DateTimeOffset? beneficio_hasta { get; set; }
        public bool mostrar_disponibles { get; set; }
        public string? mensaje_post_registro { get; set; }
        public string? origen_default { get; set; }
        public bool permite_reutilizar_audiencia { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        // Navigation
        public ef_evento_accesos acceso { get; set; } = null!;
        public ef_usuarios? usuario_creador { get; set; }
        public ef_eventos? ef_eventos { get; set; }
        public virtual ef_param_tipos_beneficio_registro? tipo_beneficio_registro { get; set; }
        public ICollection<ef_rsvp_grupos> rsvp_grupos { get; set; } = new List<ef_rsvp_grupos>();
    }

}
