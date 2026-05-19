using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_cuenta_usuario_invitaciones : IRegistroUnico
    {
        public long id_cuenta_usuario_invitacion { get; set; }

        public long id_cuenta { get; set; }
        public string email_invitado { get; set; } = null!;
        public short id_rol { get; set; }

        public string token { get; set; } = null!;
        public string estado { get; set; } = "P"; // P/A/V/C

        public DateTimeOffset? fecha_expiracion { get; set; }
        public DateTimeOffset? fecha_aceptacion { get; set; }

        public long id_usuario_invita { get; set; }
        public long? id_usuario_acepta { get; set; }

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "token" };

        public virtual ef_cuentas? cuenta { get; set; }
        public virtual ef_roles? rol { get; set; }
        public virtual ef_usuarios? usuario_invita { get; set; }
        public virtual ef_usuarios? usuario_acepta { get; set; }
    }
}