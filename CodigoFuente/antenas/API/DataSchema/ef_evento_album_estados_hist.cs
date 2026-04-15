using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    public class ef_evento_album_estados_hist
    {
        [Key]
        public long id_hist { get; set; }

        public long id_foto { get; set; }

        [MaxLength(20)]
        public string? estado { get; set; }

        public long? id_usuario { get; set; }
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey("id_foto")]
        public virtual ef_evento_album_fotos foto { get; set; } = null!;

        [ForeignKey("id_usuario")]
        public virtual ef_usuarios? usuario { get; set; }
    }
}
