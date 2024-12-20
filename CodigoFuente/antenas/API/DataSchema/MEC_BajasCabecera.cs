using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_BajasCabecera
    {
    
        public int IdBajaCabecera { get; set; }
        public int IdCabecera { get; set; }
        public int IdEstablecimiento { get; set; }
        public int Mes { get; set; }

        public int Anio { get; set; }
        public DateTime? FechaApertura { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public int? Confecciono { get; set; } //asociado a IdUsuario de MEC_Usuarios
        public string SinNovedades { get; set; }
        public string Observaciones { get; set; }
        public string Estado { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
        public virtual MEC_Establecimientos? Establecimiento { get; set; }
        public virtual MEC_Usuarios? Usuario { get; set; }
        public virtual ICollection<MEC_BajasDetalle>? BajasDetalle { get; set; } = new List<MEC_BajasDetalle>();
    }
}
