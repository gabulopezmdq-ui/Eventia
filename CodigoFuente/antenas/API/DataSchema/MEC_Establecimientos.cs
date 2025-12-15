using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_Establecimientos : IRegistroUnico
    {
        public int IdEstablecimiento { get; set; }
        public string NroDiegep { get; set; }
        public int IdTipoEstablecimiento { get; set; }
        public string NroEstablecimiento { get; set; }
        public string NombreMgp { get; set; }
        public string NombrePcia { get; set; }
        public string Domicilio { get; set; }
        public string Telefono { get; set; }
        public string UE { get; set; }
        public string CantSecciones { get; set; }
        public string CantTurnos { get; set; }
        public string Ruralidad { get; set; }
        public string Subvencion { get; set; }
        public string Vigente { get; set; }
        public string[] UniqueProperties => new[] { "NroDiegep" }; //  CodCategoria es unico
        public virtual MEC_TiposEstablecimientos? TipoEstablecimientos { get; set; }
        public virtual ICollection<MEC_POF>? POFs { get; set; } = new List<MEC_POF>();
        public virtual ICollection<MEC_UsuariosEstablecimientos>? UsuarioEstablecimiento { get; set; } = new List<MEC_UsuariosEstablecimientos>();
        public virtual ICollection<MEC_InasistenciasCabecera>? Inasistencias { get; set; } = new List<MEC_InasistenciasCabecera>();
        public virtual ICollection<MEC_MovimientosCabecera>? Movimientos { get; set; } = new List<MEC_MovimientosCabecera>();
        public virtual ICollection<MEC_Mecanizadas>? Mecanizada { get; set; } = new List<MEC_Mecanizadas>();
        public virtual ICollection<MEC_BajasCabecera>? BajaCabecera { get; set; } = new List<MEC_BajasCabecera>();

        public virtual ICollection<MEC_MovimientosBajas>? MovimientosBaja { get; set; } = new List<MEC_MovimientosBajas>();
        public List<MEC_TMPErroresMecanizadas>? TMPErroresMecanizadas { get; set; } = new();
        public virtual ICollection<MEC_InasistenciasDetalle>? Detalle { get; set; } = new List<MEC_InasistenciasDetalle>();
        public virtual ICollection<MEC_MovimientosSuperCabecera>? SuperCabecera { get; set; } = new List<MEC_MovimientosSuperCabecera>();

        public ICollection<MEC_RetencionesXMecanizadas>? RetencionesXMecanizadas { get; set; }


    }
}
