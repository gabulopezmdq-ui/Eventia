using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_roles : IRegistroUnico
    {
        public short id_rol { get; set; }
        public string codigo { get; set; } = null!;
        public string? descripcion { get; set; }
        public bool activo { get; set; }
        public string[] UniqueProperties => new[] { "codigo" };

        public virtual ICollection<ef_usuarios_roles> ef_usuarios_roles { get; set; } = new List<ef_usuarios_roles>();

    }
}
