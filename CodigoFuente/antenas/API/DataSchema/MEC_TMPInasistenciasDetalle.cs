using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPInasistenciasDetalle
    {
        public int IdTMPInasistenciasDetalle { get; set; }
        public int IdCabecera { get; set; }
        public int IdInasistenciaCabecera { get; set; }
        public string DNI { get; set; }
        public int? NroLegajo { get; set; }
        public int? NroCargo { get; set; }
        public string UE { get; set; }
        public int? Grupo { get; set; }
        public int? Nivel { get; set; }
        public int? Modulo { get; set; }
        public int? Cargo { get; set; }
        public DateTime? FecNov { get; set; }
        public int? CodLicen { get; set; }
        public int? Cantidad { get; set; }
        public int? Hora { get; set; }
        public string RegistroValido { get; set; } // 'S' o 'N'
        public string RegistroProcesado { get; set; } // 'S' o 'N'

        // Propiedades de navegación (si usás relaciones)
        public virtual MEC_CabeceraLiquidacion CabeceraLiquidacion { get; set; }
        public virtual MEC_InasistenciasCabecera InasistenciasCabecera { get; set; }
        public virtual ICollection<MEC_TMPErroresInasistenciasDetalle>? ErroresTMPInasistenciasDetalle { get; set; } = new List<MEC_TMPErroresInasistenciasDetalle>();
        public virtual ICollection<MEC_InasistenciasDetalle>? Detalle { get; set; } = new List<MEC_InasistenciasDetalle>();

    }
}
