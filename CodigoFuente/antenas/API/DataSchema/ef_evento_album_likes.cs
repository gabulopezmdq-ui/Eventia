using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    public class ef_evento_album_likes
    {
        public long id_foto { get; set; }
        public long id_evento { get; set; }

        [Required]
        [MaxLength(100)]
        public string device_id { get; set; } = null!;

        public long? id_invitado { get; set; }
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey("id_foto")]
        public virtual ef_evento_album_fotos foto { get; set; } = null!;

        [ForeignKey("id_evento")]
        public virtual ef_eventos evento { get; set; } = null!;

        [ForeignKey("id_invitado")]
        public virtual ef_invitados? invitado { get; set; }
    }
}
