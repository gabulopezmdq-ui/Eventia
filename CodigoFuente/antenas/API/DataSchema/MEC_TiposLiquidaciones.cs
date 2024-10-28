using API.DataSchema.Interfaz;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TiposLiquidaciones : IRegistroUnico
    {
        public int IdTipoLiquidacion { get; set; }
        public string Descripcion { get; set; }
        public string Vigente { get; set; }
        public string[] UniqueProperties => new[] { "Descripcion" }; //  CodCategoria es unico
    }
}
