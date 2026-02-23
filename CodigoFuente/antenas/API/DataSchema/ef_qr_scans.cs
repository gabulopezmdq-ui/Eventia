using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_qr_scans
    {
        public long id_qr_scan { get; set; }

        public long? id_evento { get; set; }

        public string qr_token { get; set; } = null!;

        public long? id_invitado { get; set; }

        /// <summary>
        /// O = OK, N = No encontrado, E = Error
        /// </summary>
        public string resultado { get; set; } = null!;

        public string? mensaje { get; set; }

        public DateTimeOffset fecha_scan { get; set; }

        public long? id_usuario_operador { get; set; }

        public string? device_id { get; set; }
        public string? ip { get; set; }
        public string? user_agent { get; set; }

        // Navigation
        public ef_eventos? evento { get; set; }
        public ef_invitados? invitado { get; set; }
        public ef_usuarios? usuario_operador { get; set; }
    }
}
