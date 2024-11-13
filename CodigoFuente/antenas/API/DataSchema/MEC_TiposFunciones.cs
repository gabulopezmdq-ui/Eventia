using API.DataSchema.Interfaz;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TiposFunciones : IRegistroUnico
    {
        public int IdTipoFuncion { get; set; }
        public string CodFuncion { get; set; }
        public string CodFuncionMGP { get; set; }
        public string Descripcion { get; set; }
        public string Vigente { get; set; }
        public string[] UniqueProperties => new[] { "CodFuncion"}; //  CodCategoria es unico
        public virtual ICollection<MEC_POF>? POFs { get; set; } = new List<MEC_POF>();

    }
}
