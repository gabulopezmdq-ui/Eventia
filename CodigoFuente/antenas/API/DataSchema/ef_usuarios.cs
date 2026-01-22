using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_usuarios : IRegistroUnico
    {
        public long id_usuario { get; set; }

        public string email { get; set; } = null!;

        // ahora nullable (para Google)
        public string? password_hash { get; set; }

        public string nombre { get; set; } = null!;
        public string apellido { get; set; } = null!;

        public bool email_verificado { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
        public bool activo { get; set; }

        // Nuevos
        public string auth_provider { get; set; } = "local"; // local | google
        public string? google_sub { get; set; }
        public string? avatar_url { get; set; }

        public string[] UniqueProperties => new[] { "email" };
    }
}
