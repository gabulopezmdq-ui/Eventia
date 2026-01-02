using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema {
    public class MEC_RetencionesXMecanizadas
    {
        public int IdRetencionXMecanizada { get; set; }
        public int IdRetencion { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdCabecera { get; set; }
        public decimal Importe { get; set; }
        public string Signo { get; set; }

        // Navegación
        public MEC_Retenciones? Retencion { get; set; }
        public MEC_Establecimientos? Establecimiento { get; set; }

        public MEC_CabeceraLiquidacion? Cabecera { get; set; }
    }
}