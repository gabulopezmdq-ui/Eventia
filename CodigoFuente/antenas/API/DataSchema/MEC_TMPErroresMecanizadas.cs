using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPErroresMecanizadas
    {
        public int IdTMPErrorMecanizada { get; set; }
        public int IdCabecera { get; set; }
        public int IdTMPMecanizada { get; set; }
        public string Documento { get; set; }
        public string POF { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
    }
}
