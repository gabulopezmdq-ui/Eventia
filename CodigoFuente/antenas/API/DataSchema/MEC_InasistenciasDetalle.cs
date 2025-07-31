using System;
using System.Collections;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_InasistenciasDetalle
    {

        public int IdInasistenciasDetalle { get; set; }
        public int IdInasistenciaCabecera { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdPOF { get; set; }
        public int IdPOFBarra { get; set; }
        public int? IdTMPInasistenciasDetalle { get; set; }
        public int? CodLicencia { get; set; }
        public DateTime? Fecha { get; set; }
        public int? CantHs { get; set; }
        public int? CantMin { get; set; }
        public string? EstadoRegistro { get; set; }
        public string? MotivoRechazo { get; set; }
        public int? IdUsuario { get; set; }
        public virtual MEC_InasistenciasCabecera? InasistenciaCabecera { get; set; }  // Relación con una sola cabecera
        public virtual MEC_Usuarios? Usuario { get; set; }
        public virtual MEC_POF? POF { get; set; }
        public virtual MEC_Establecimientos? Establecimiento { get; set; }
        public virtual MEC_POF_Barras? POFBarra { get; set; }
        public virtual MEC_TMPInasistenciasDetalle? TMPInasistenciasDetalle { get; set; }
        public virtual ICollection<MEC_InasistenciasRechazo>? InasistenciasRechazos { get; set; }

    }
}
