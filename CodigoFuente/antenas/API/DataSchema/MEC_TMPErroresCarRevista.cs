using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPErroresCarRevista
    {
        public int IdTMPErrorCarRevista { get; set; }
        public int IdCabecera { get; set; }
        public string CaracterRevista { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
    }
}
