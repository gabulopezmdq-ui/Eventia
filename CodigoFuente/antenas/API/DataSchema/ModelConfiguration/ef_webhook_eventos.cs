using System;

namespace API.DataSchema
{
    public class ef_webhook_eventos
    {
        public long id_webhook { get; set; }
        public string external_provider { get; set; } = null!;
        public string external_event_id { get; set; } = null!;
        public string tipo_evento { get; set; } = null!;
        public bool procesado { get; set; }
        public string? raw_payload { get; set; }
        public string? error { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_procesado { get; set; }
    }
}
