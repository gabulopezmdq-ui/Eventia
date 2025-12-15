using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema {
    public class MEC_Retenciones
    {
        public int IdRetencion { get; set; }
        public string Descripcion { get; set; }
        public string Vigente { get; set; }

        public ICollection<MEC_RetencionesXMecanizadas> RetencionesXMecanizadas { get; set; }
    }
}