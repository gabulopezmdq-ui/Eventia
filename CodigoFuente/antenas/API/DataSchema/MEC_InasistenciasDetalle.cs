using System;
using System.Collections;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_InasistenciasDetalle
    {
    
        public int IdInasistenciaDetalle { get; set; }
        public int IdInasistenciaCabecera{ get; set; }
        public int IdPOF { get; set; }
        public int IdUsuario { get; set; }
        public DateTime? Fecha { get; set; }
        public int CantHs{ get; set; }
        public int CantMin { get; set; }
        public string EstadoRegistro { get; set; }
        public string MotivoRechazo { get; set; }
        public virtual MEC_InasistenciasCabecera? InasistenciaCabecera { get; set; }  // Relación con una sola cabecera
        public virtual MEC_Usuarios? Usuarios { get; set; }
        public virtual MEC_POF? POF { get; set; }
    }
}
