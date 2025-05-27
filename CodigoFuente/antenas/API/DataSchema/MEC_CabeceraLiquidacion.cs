using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_CabeceraLiquidacion
    {
    
        public int IdCabecera { get; set; }
        public int idTipoLiquidacion { get; set; }
        public string? LeyendaTipoLiqReporte { get; set; }

        public string MesLiquidacion { get; set; }
        public string? AnioLiquidacion { get; set; }
        public int IdUsuario { get; set; }
        public string? Observaciones { get; set; }
        public string? ObservacionesInasistencias { get; set; }
        public string? ObservacionesBajas { get; set; }
        public DateTime? InicioLiquidacion { get; set; }
        public DateTime? FinLiquidacion { get; set; }
        public string? Estado { get; set; }
        public string? CalculaInasistencias { get; set; }
        public string? CalculaBajas { get; set; }
        public int? CantDocentes { get; set; }
        public decimal? RetenDeno7 { get; set; }
        public string OrdenPago { get; set; }
        public string Vigente { get; set; }
        public virtual MEC_TiposLiquidaciones? TipoLiquidacion { get; set; }
        public virtual MEC_Usuarios? Usuarios { get; set; }
        public virtual ICollection<MEC_InasistenciasCabecera>? Cabeceras { get; set; } = new List<MEC_InasistenciasCabecera>();
        public virtual ICollection<MEC_Mecanizadas>? Mecanizadas { get; set; } = new List<MEC_Mecanizadas>();
        public virtual ICollection<MEC_CabeceraLiquidacionEstados>? EstadoCabecera { get; set; } = new List<MEC_CabeceraLiquidacionEstados>();
        public virtual ICollection<MEC_BajasCabecera>? BajaCabecera { get; set; } = new List<MEC_BajasCabecera>();
        public virtual ICollection<MEC_POFDetalle>? POFDetalle { get; set; } = new List<MEC_POFDetalle>();
    }
}
