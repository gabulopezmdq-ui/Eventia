using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_evento_checkins : IRegistroUnico
    {
        public long id_checkin { get; set; }
        public long id_evento { get; set; }
        public long id_invitado { get; set; }
        public long? id_acceso { get; set; }
        public long? id_acceso_link { get; set; }
        public string tipo { get; set; } = null!;
        public DateTimeOffset fecha { get; set; }
        public long? id_usuario_operador { get; set; }
        public string? observaciones { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_invitados? invitado { get; set; }
        public virtual ef_evento_accesos? acceso { get; set; }
        public virtual ef_evento_acceso_links? acceso_link { get; set; }
        public virtual ef_usuarios? usuario_operador { get; set; }
    }
}
