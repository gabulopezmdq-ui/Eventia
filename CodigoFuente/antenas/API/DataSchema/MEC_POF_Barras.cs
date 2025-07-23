using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_POF_Barras
    {
        public int IdPOFBarra { get; set; }
        public int IdPOF { get; set; }
        public int Barra { get; set; }

        // Propiedades de navegación
        public virtual MEC_POF? POF { get; set; }
        public virtual ICollection<MEC_InasistenciasDetalle>? Detalle { get; set; } = new List<MEC_InasistenciasDetalle>();
    }
}
