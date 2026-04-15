using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    public class ef_evento_album_rankings
    {
        [Key]
        public long id_ranking { get; set; }

        public long id_evento { get; set; }

        [Required]
        [MaxLength(120)]
        public string nombre { get; set; } = null!;

        [MaxLength(20)]
        public string? modo { get; set; } // AUTOMATICO | CONCURSO

        [MaxLength(20)]
        public string? alcance { get; set; } // EVENTO | TRAMO | FOTOCABINA | DESTACADAS

        public long? id_tramo { get; set; }

        [MaxLength(20)]
        public string? solo_origen { get; set; }

        public bool solo_destacadas { get; set; } = false;

        public bool activo { get; set; } = true;
        public bool visible_publico { get; set; } = true;
        public bool mostrar_resultados { get; set; } = true;
        public bool mostrar_votos { get; set; } = true;

        public DateTimeOffset? fecha_inicio { get; set; }
        public DateTimeOffset? fecha_fin { get; set; }
        public bool cerrado { get; set; } = false;

        public short cantidad_ganadoras { get; set; } = 1;

        public long? id_foto_ganadora { get; set; }

        [ForeignKey("id_evento")]
        public virtual ef_eventos evento { get; set; } = null!;

        [ForeignKey("id_tramo")]
        public virtual ef_evento_tramos? tramo { get; set; }

        [ForeignKey("id_foto_ganadora")]
        public virtual ef_evento_album_fotos? foto_ganadora { get; set; }

        public virtual ICollection<ef_evento_album_ranking_votos> votos { get; set; } = new List<ef_evento_album_ranking_votos>();
    }
}
