using System;

namespace API.DataSchema
{
    public class ef_evento_live_ganadores
    {
        public long id_ganador { get; set; }
        public long id_premio { get; set; }
        public long id_dinamica { get; set; }
        public long? id_respuesta { get; set; }
        public long id_evento { get; set; }
        public long? id_invitado { get; set; }
        public string? token_consulta { get; set; }
        public int? orden_ganador { get; set; }
        public string estado { get; set; } = "PENDIENTE";
        public string? observaciones { get; set; }
        public DateTimeOffset fecha_ganador { get; set; }
        public DateTimeOffset? fecha_entrega { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
        public string? qr_token_premio { get; set; }
        public DateTimeOffset? fecha_generacion_qr { get; set; }
        public long? entregado_por_usuario { get; set; }
    }
}