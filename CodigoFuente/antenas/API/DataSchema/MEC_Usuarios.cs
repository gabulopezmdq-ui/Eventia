using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema
{
    public class MEC_Usuarios : IRegistroUnico
    {
        public virtual int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public bool? Activo { get; set; }
        public virtual ICollection<MEC_RolesXUsuarios> UsuariosXRoles { get; set; } = new List<MEC_RolesXUsuarios>();

        public string[] UniqueProperties => new[] {""};
    }
}
