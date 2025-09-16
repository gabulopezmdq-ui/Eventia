using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema
{
    public class MEC_Usuarios : IRegistroUnico
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public bool? Activo { get; set; }
        public string? ApellidoPersona { get; set; }
        public string? NombrePersona { get; set; }
        public virtual ICollection<MEC_RolesXUsuarios> UsuariosXRoles { get; set; } = new List<MEC_RolesXUsuarios>();
        public virtual ICollection<MEC_CabeceraLiquidacion> CabeceraLiquidacion { get; set; } = new List<MEC_CabeceraLiquidacion>();
        public virtual ICollection<MEC_UsuariosEstablecimientos> UsXEstablecimiento { get; set; } = new List<MEC_UsuariosEstablecimientos>();
        public virtual ICollection<MEC_InasistenciasCabecera> Inasistencias { get; set; } = new List<MEC_InasistenciasCabecera>();
        public virtual ICollection<MEC_Mecanizadas> Mecanizadas { get; set; } = new List<MEC_Mecanizadas>();
        public virtual ICollection<MEC_BajasCabecera> BajaCabecera { get; set; } = new List<MEC_BajasCabecera>();
        public virtual ICollection<MEC_BajasDetalle> BajaDetalle { get; set; } = new List<MEC_BajasDetalle>();
        public virtual ICollection<MEC_CabeceraLiquidacionEstados> CabeceraLiqEstados { get; set; } = new List<MEC_CabeceraLiquidacionEstados>();
        public virtual ICollection<MEC_InasistenciasDetalle>? Detalle { get; set; } = new List<MEC_InasistenciasDetalle>();
        public virtual ICollection<MEC_InasistenciasRechazo>? Rechazo { get; set; } = new List<MEC_InasistenciasRechazo>();
        public string[] UniqueProperties => new[] {"Nombre"};
    }
}
