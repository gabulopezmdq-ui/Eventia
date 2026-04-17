using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_invitado_preferencias_musicales : IRegistroUnico
    {
        public long id_invitado { get; set; }
        public long id_preferencia_musical { get; set; }
        public DateTimeOffset fecha_alta { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_invitados? invitado { get; set; }
        public virtual ef_param_preferencias_musicales? preferencia_musical { get; set; }
    }
}

