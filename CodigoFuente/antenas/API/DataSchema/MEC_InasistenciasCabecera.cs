using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_InasistenciasCabecera
    {
    
        public int IdInasistenciaCabecera { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdCabecera { get; set; }
        public int Confecciono { get; set; } //idUsuario { get; set; }
        public int? Mes { get; set; }
        public int? Anio { get; set; }
        public DateTime? FechaApertura { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public string? SinNovedades { get; set; }
        public string? Observaciones { get; set; }
        public string Estado { get; set; }
        public virtual MEC_Establecimientos? Establecimientos { get; set; }
        public virtual MEC_Usuarios? Usuarios { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
        public virtual ICollection<MEC_InasistenciasDetalle>? Detalle { get; set; } = new List<MEC_InasistenciasDetalle>();
        public virtual ICollection<MEC_TMPInasistenciasDetalle>? TMPInasistenciasDetalle { get; set; } = new List<MEC_TMPInasistenciasDetalle>();
    }
}
