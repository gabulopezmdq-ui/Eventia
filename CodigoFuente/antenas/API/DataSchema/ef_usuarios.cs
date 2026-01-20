using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_usuarios : IRegistroUnico
    {
        public long id_usuario { get; set; }
        public string email { get; set; } = null!;
        public string password_hash { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string apellido { get; set; } = null!;
        public bool email_verificado { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
        public bool activo { get; set; }
        public string[] UniqueProperties => new[] { "email" };

        public virtual ICollection<ef_usuarios_roles> ef_usuarios_roles { get; set; } = new List<ef_usuarios_roles>();
    }   
}
