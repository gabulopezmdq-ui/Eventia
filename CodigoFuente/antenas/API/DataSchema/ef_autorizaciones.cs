using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_autorizaciones
    {
        public long id_autorizacion { get; set; }
        public long id_evento { get; set; }
        public long id_invitado_objetivo { get; set; }

        public string tipo { get; set; } = "R"; // 'R','C','O'
        public string nombre_autorizado { get; set; } = null!;
        public string? telefono_autorizado { get; set; }
        public string? relacion { get; set; }
        public string? observaciones { get; set; }

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_baja { get; set; }
        public string? qr_token { get; set; }

        public ef_eventos evento { get; set; } = null!;
        public ef_invitados invitado_objetivo { get; set; } = null!;
    }
}
