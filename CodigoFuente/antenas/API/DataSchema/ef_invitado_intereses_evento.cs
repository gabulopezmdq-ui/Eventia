using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_invitado_intereses_evento : IRegistroUnico
    {
        public long id_invitado { get; set; }
        public long id_interes_evento_publico { get; set; }
        public DateTimeOffset fecha_alta { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_invitados? invitado { get; set; }
        public virtual ef_param_intereses_evento_publico? interes_evento_publico { get; set; }
    }
}