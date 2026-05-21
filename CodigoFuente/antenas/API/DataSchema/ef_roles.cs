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

        public string categoria { get; set; } = "SISTEMA";
        public string aplica_tipo_operacion { get; set; } = "AMBOS";
        public bool asignable_equipo_evento { get; set; }
        public bool asignable_staff_operativo { get; set; }
        public bool requiere_usuario { get; set; }
        public bool permite_codigo_staff { get; set; }
        public int orden_ui { get; set; } = 1;
        public string? pantalla_inicio { get; set; }
        public string[] UniqueProperties => new[] { "codigo" };

        public virtual ICollection<ef_usuarios_roles> ef_usuarios_roles { get; set; } = new List<ef_usuarios_roles>();

    }
}
