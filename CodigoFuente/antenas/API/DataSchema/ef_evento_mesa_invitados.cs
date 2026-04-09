using System;

namespace API.DataSchema
{
    public class ef_evento_mesa_invitados
    {
        public long id_mesa { get; set; }
        public long id_invitado { get; set; }
        public DateTimeOffset fecha_alta { get; set; }

        // Nav
        public ef_evento_mesas mesa { get; set; } = null!;
        public ef_invitados invitado { get; set; } = null!;
    }
}
