using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    public class ef_evento_album_overlays
    {
        [Key]
        public long id_overlay { get; set; }

        public long id_evento { get; set; }

        [MaxLength(120)]
        public string? nombre { get; set; }

        [MaxLength(240)]
        public string? descripcion { get; set; }

        [MaxLength(500)]
        public string? storage_key { get; set; }

        [MaxLength(1000)]
        public string? url_publica { get; set; }

        [MaxLength(1000)]
        public string? thumbnail_url { get; set; }

        public short? orden { get; set; }
        public bool es_default { get; set; } = false;
        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey("id_evento")]
        public virtual ef_eventos evento { get; set; } = null!;

        public virtual ICollection<ef_evento_album_fotocabina_usos> usos { get; set; } = new List<ef_evento_album_fotocabina_usos>();
    }
}
