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

        public string metodo_validacion { get; set; } = null!; // A=Autorizado QR, M=Manual, O=Otro

        public string? observaciones { get; set; }

        public DateTimeOffset fecha_retiro { get; set; }

        public DateOnly fecha_operativa { get; set; }

        public long? id_usuario_operador { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_eventos? evento { get; set; }

        public virtual ef_invitados? invitado_nino { get; set; }

        public virtual ef_autorizaciones? autorizacion { get; set; }

        public virtual ef_usuarios? usuario_operador { get; set; }
    }   
}
