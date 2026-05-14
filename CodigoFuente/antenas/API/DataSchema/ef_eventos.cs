using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_eventos : IRegistroUnico
    {
        public long id_evento { get; set; }

        public int id_tipo_evento { get; set; }
        public short id_idioma { get; set; }

        public short? id_pais { get; set; }

        // B2B
        public long? id_cuenta { get; set; }
        public long? id_unidad { get; set; }

        // B2B (cliente final del salón)
        public long? id_cliente { get; set; }

        public string anfitriones_texto { get; set; } = null!;

        public short? id_dress_code { get; set; }
        public string? dress_code_descripcion { get; set; }

        public string? saludo { get; set; }
        public string? mensaje_bienvenida { get; set; }
        public string? notas { get; set; }

        public DateTimeOffset? fecha_evento { get; set; }
        
        public string tipo_operacion { get; set; } = "EVENTO"; // EVENTO | PROGRAMA
        public DateOnly? fecha_inicio { get; set; }
        public DateOnly? fecha_fin { get; set; }
        
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string estado { get; set; } = null!; // char(1)

        public string? rsvp_public_token { get; set; }          // varchar(64)
        public long? id_usuario_rsvp_link_creator { get; set; } // FK ef_usuarios

        public string modo_acceso { get; set; } = null!;        // char(1) NOT NULL
        public string modo_asistencia { get; set; } = null!;    // char(1) NOT NULL
        public bool es_publico { get; set; }                    // bool NOT NULL

        public long? id_acceso_default { get; set; }            // FK ef_evento_accesos
        public long? id_plan { get; set; }                      // FK ef_planes

        public string? info_publica { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        // Navegaciones
        public virtual ef_tipos_evento? tipo_evento { get; set; }
        public virtual ef_idiomas? idioma { get; set; }
        public virtual ef_dress_code? dress_code { get; set; }
        public virtual ef_clientes? cliente { get; set; }
        public virtual ef_usuarios? usuario_rsvp_link_creator { get; set; }

        public virtual ef_planes? plan { get; set; }
        public virtual ef_evento_accesos? acceso_default { get; set; }

        public virtual ef_cuentas? cuenta { get; set; }
        public virtual ef_cuenta_unidades? unidad { get; set; }

        // Álbum
        public virtual ef_evento_album_config? album_config { get; set; }
        public virtual ICollection<ef_evento_album_fotos> album_fotos { get; set; } = new List<ef_evento_album_fotos>();
        public virtual ICollection<ef_evento_album_overlays> album_overlays { get; set; } = new List<ef_evento_album_overlays>();
        public virtual ICollection<ef_evento_album_rankings> album_rankings { get; set; } = new List<ef_evento_album_rankings>();
    }
}
