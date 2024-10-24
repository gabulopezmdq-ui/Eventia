using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPErroresEstablecimientos
    {
        public int IdTMPErrorEstablecimiento { get; set; }
        public int IdCabecera { get; set; }
        public string NroEstab { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
    }
}
