    using System.Collections.Generic;

    namespace API.DataSchema
    {
        public class MEC_TMPErroresInasistenciasDetalle
        {
            public int IdTMPErrorInasistencia { get; set; }
            public int IdCabeceraInasistencia { get; set; }
            public int IdTMPInasistenciasDetalle { get; set; }
            public string Documento { get; set; }
            public string Legajo { get; set; }
            public string POF { get; set; }
            public string POFBarra { get; set; }

            public virtual MEC_CabeceraLiquidacion Cabecera { get; set; }
            public virtual MEC_TMPInasistenciasDetalle TMPInasistencia { get; set; }
        }
    }
