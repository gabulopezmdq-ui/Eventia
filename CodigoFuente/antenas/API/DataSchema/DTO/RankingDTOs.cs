using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class RankingCreateDTO
    {
        public string nombre { get; set; } = null!;
        public string modo { get; set; } = "AUTOMATICO"; // AUTOMATICO | CONCURSO
        public string alcance { get; set; } = "EVENTO"; // EVENTO | TRAMO | FOTOCABINA | DESTACADAS
        public long? id_tramo { get; set; }
        public string? solo_origen { get; set; }
        public bool solo_destacadas { get; set; }
        public DateTimeOffset? fecha_inicio { get; set; }
        public DateTimeOffset? fecha_fin { get; set; }
        public short cantidad_ganadoras { get; set; } = 1;
    }

    public class RankingVotoDTO
    {
        public long id_ranking { get; set; }
        public long id_foto { get; set; }
        public string device_id { get; set; } = null!;
        public long? id_invitado { get; set; }
    }

    public class RankingResultDTO
    {
        public long id_foto { get; set; }
        public string? url_publica { get; set; }
        public string? nombre_invitado { get; set; }
        public int votos_count { get; set; }
        public bool es_ganadora { get; set; }
    }
}
