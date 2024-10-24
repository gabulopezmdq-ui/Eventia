using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPErroresTiposEstablecimientos
    {
        public int IdTMPErrorTipoEstablecimiento { get; set; }
        public int IdCabecera { get; set; }
        public string TipoOrganizacion { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
    }
}
