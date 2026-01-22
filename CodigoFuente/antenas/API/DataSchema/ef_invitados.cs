using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_invitados : IRegistroUnico
    {
        public long id_invitado { get; set; }

        public long id_evento { get; set; }

        public string nombre { get; set; } = null!;
        public string apellido { get; set; } = null!;
        public string? sobrenombre { get; set; }

        public string? email { get; set; }
        public string? celular { get; set; }

        public string rsvp_token { get; set; } = null!;
        public string rsvp_estado { get; set; } = null!; // char(1): P/Y/N
        public string? rsvp_mensaje { get; set; }

        public DateTimeOffset? fecha_rsvp { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public bool activo { get; set; }

        public string[] UniqueProperties => new[] { "rsvp_token" };

        // Navegación
        public virtual ef_eventos? evento { get; set; }
    }   
}
