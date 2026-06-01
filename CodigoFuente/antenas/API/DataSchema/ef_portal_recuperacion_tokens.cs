using System;

namespace API.DataSchema
{
    public class ef_portal_recuperacion_tokens
    {
        public long id_portal_recuperacion_token { get; set; }
        public long id_portal_persona { get; set; }
        public string token_recuperacion { get; set; } = null!;
        public string? codigo { get; set; }
        public string canal { get; set; } = null!;
        public string destino { get; set; } = null!;
        public bool usado { get; set; }
        public DateTimeOffset fecha_expiracion { get; set; }
        public DateTimeOffset? fecha_uso { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
    }
}
