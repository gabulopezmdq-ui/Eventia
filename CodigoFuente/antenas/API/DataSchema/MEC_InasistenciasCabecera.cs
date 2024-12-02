using System;

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
        public DateTime? InicioLiquidacion { get; set; }
        public DateTime? FinLiquidacion { get; set; }
        public string Estado { get; set; }
        public string? CalculaInasistencias { get; set; }
        public string? CalculaBajas { get; set; }
        public int? CantDocentes { get; set; }
        public decimal? RetenDeno7 { get; set; }
        public string Vigente { get; set; }
        public virtual MEC_TiposLiquidaciones? TipoLiquidacion { get; set; }
        public virtual MEC_Usuarios? Usuarios { get; set; }
    }
}
