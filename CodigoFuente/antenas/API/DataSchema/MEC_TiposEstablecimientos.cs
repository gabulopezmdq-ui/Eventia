using API.DataSchema.Interfaz;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TiposEstablecimientos : IRegistroUnico
    {
        public int IdTipoEstablecimiento { get; set; }
        public string CodTipoEstablecimiento { get; set; }
        public string Descripcion { get; set; }
        public string Vigente { get; set; }
        public string[] UniqueProperties => new[] { "CodTipoEstablecimiento" }; //  CodCategoria es unico
        public virtual ICollection<MEC_Establecimientos>? Establecimientos { get; set; } = new List<MEC_Establecimientos>();
    }
}
