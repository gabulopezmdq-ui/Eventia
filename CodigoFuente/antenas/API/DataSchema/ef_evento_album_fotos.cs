using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    public class ef_evento_album_fotos
    {
        [Key]
        public long id_foto { get; set; }

        public long id_evento { get; set; }
        public long? id_tramo { get; set; }
        public long? id_overlay { get; set; }
        public long? id_invitado { get; set; }

        [MaxLength(100)]
        public string? device_id { get; set; }

        [Required]
        [MaxLength(20)]
        public string storage_provider { get; set; } = null!; // LOCAL | S3

        [MaxLength(100)]
        public string? storage_bucket { get; set; }

        [Required]
        [MaxLength(500)]
        public string storage_key { get; set; } = null!;

        [MaxLength(1000)]
        public string? url_publica { get; set; }

        [MaxLength(1000)]
        public string? thumbnail_url { get; set; }

        [MaxLength(255)]
        public string? nombre_original { get; set; }

        [MaxLength(100)]
        public string? mime_type { get; set; }

        public long? tamano_bytes { get; set; }
        public int? ancho { get; set; }
        public int? alto { get; set; }

        [MaxLength(100)]
        public string? nombre_invitado { get; set; }

        [MaxLength(500)]
        public string? mensaje { get; set; }

        [Required]
        [MaxLength(20)]
        public string origen { get; set; } = null!; // INVITADO | ADMIN | LIVE | FOTOCABINA

        [Required]
        [MaxLength(20)]
        public string estado { get; set; } = "PENDIENTE"; // PENDIENTE | APROBADA | RECHAZADA

        public bool es_destacada { get; set; } = false;
        public int likes_count { get; set; } = 0;
        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey("id_evento")]
        public virtual ef_eventos evento { get; set; } = null!;

        [ForeignKey("id_tramo")]
        public virtual ef_evento_tramos? tramo { get; set; }

        [ForeignKey("id_invitado")]
        public virtual ef_invitados? invitado { get; set; }

        public virtual ICollection<ef_evento_album_likes> likes { get; set; } = new List<ef_evento_album_likes>();
        public virtual ICollection<ef_evento_album_estados_hist> historial_estados { get; set; } = new List<ef_evento_album_estados_hist>();
    }
}
