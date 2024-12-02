using System;

namespace API.DataSchema
{
    public class MEC_InasistenciasCabecera
    {
    
        public int IdInasistenciaCabecera { get; set; }
        public int IdEstablecimiento { get; set; }
        public int Confecciono { get; set; } //idUsuario { get; set; }
        public int Mes { get; set; }
        public int Anio { get; set; }
        public DateTime? FechaApertura { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public string SinNovedades { get; set; }
        public virtual MEC_Establecimientos? Establecimientos { get; set; }
        public virtual MEC_Usuarios? Usuarios { get; set; }
    }
}
