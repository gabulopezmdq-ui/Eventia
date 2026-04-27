using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    public class ef_evento_album_config
    {
        [Key]
        public long id_evento { get; set; }

        public bool moderacion_obligatoria { get; set; } = true;
        public bool permitir_nombre_invitado { get; set; } = true;
        public bool permitir_mensaje { get; set; } = true;
        public bool permitir_likes { get; set; } = true;
        public bool permitir_descarga { get; set; } = false;
        public bool mostrar_solo_aprobadas { get; set; } = true;

        [Required]
        [MaxLength(20)]
        public string live_modo { get; set; } = "TODAS";

        public bool fotocabina_activa { get; set; } = false;
        public long? fotocabina_overlay_default_id { get; set; }

        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey("id_evento")]
        public virtual ef_eventos evento { get; set; } = null!;
    }
}
