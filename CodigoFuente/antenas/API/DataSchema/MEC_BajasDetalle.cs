using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_BajasDetalle
    {

        public int IdBajaDetalle { get; set; }
        public int IdBajasCabecera { get; set; }
        public int IdPOF { get; set; }
        public int IdMotivoBaja { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
        public int CantHs { get; set; }
        public int CantMin { get; set; }
        public string Observaciones { get; set; }
        public string EstadoRegistro { get; set; }
        public string MotivoRechazo { get; set; }
        public int UsuarioRechazo { get; set; }
        public virtual MEC_BajasCabecera? BajaCabecera { get; set; }
        public virtual MEC_POF? POF { get; set; }
        public virtual MEC_Usuarios? Usuario { get; set; }
        public virtual MEC_MotivosBajas? MotivoBaja{ get; set; }
    }
}
