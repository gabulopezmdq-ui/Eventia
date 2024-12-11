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
        public virtual ICollection<MEC_CabeceraLiquidacion> CabeceraLiquidacion { get; set; } = new List<MEC_CabeceraLiquidacion>();
        public virtual ICollection<MEC_UsuariosEstablecimientos> UsXEstablecimiento { get; set; } = new List<MEC_UsuariosEstablecimientos>();
        public virtual ICollection<MEC_InasistenciasCabecera> Inasistencias { get; set; } = new List<MEC_InasistenciasCabecera>();
        public virtual ICollection<MEC_Mecanizadas> Mecanizadas { get; set; } = new List<MEC_Mecanizadas>();
        public string[] UniqueProperties => new[] {"Nombre"};
    }
}
