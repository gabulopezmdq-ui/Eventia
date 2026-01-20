using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_usuarios_roles : IRegistroUnico
    {
        public long id_usuario_rol { get; set; }
        public long id_usuario { get; set; }
        public short id_rol { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public bool activo { get; set; }

        public string[] UniqueProperties => new[] { "id_usuario", "id_rol" };

        public virtual ef_usuarios? usuario { get; set; }
        public virtual ef_roles? rol { get; set; }
    }   
}
