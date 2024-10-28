using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPErroresConceptos
    {
        public int IdTMPErrorConcepto { get; set; }
        public int IdCabecera { get; set; }
        public string CodigoLiquidacion { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
    }
}
