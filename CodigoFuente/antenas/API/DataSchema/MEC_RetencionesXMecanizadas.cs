using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema {
    public class MEC_RetencionesXMecanizadas
    {
        public int IdRetencionXMecanizada { get; set; }
        public int IdRetencion { get; set; }
        public int IdMecanizada { get; set; }
        public int IdEstablecimiento { get; set; }
        public decimal Importe { get; set; }

        // Navegación
        public MEC_Retenciones Retencion { get; set; }
        public MEC_Mecanizadas Mecanizada { get; set; }
        public MEC_Establecimientos Establecimiento { get; set; }
    }
}