using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPErroresFuncion
    {
        public int IdTMPErrorFuncion { get; set; }
        public int IdCabecera { get; set; }
        public string CodFuncion { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
    }
}
