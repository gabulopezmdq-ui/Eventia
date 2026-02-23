using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_retiros 
    {
        public long id_retiro { get; set; }

        public long id_evento { get; set; }
        public long id_invitado_nino { get; set; }

        public long? id_autorizacion { get; set; }

        public string nombre_retirador { get; set; } = null!;
        public string? celular_retirador { get; set; }

        /// <summary>
        /// A = En lista autorizados, M = Manual, O = Otro
        /// </summary>
        public string metodo_validacion { get; set; } = null!;

        public string? observaciones { get; set; }

        public DateTimeOffset fecha_retiro { get; set; }

        public long? id_usuario_operador { get; set; }

        // Navigation
        public ef_eventos evento { get; set; } = null!;
        public ef_invitados invitado_nino { get; set; } = null!;
        public ef_autorizaciones? autorizacion { get; set; }
        public ef_usuarios? usuario_operador { get; set; }
    }   
}
