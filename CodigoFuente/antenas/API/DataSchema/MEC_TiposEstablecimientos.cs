using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TiposEstablecimientos
    {
        public int IdTipoEstablecimiento { get; set; }
        public string CodTipoEstablecimiento { get; set; }
        public string Descripcion { get; set; }
        public string Vigente { get; set; }
        public virtual ICollection<MEC_Establecimientos>? Establecimientos { get; set; } = new List<MEC_Establecimientos>();
    }
}
