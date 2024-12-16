using Bogus.DataSets;
using System;

namespace API.DataSchema
{
    public class MEC_CabeceraLiquidacionEstados
    {
        public int IdCabeceraEstado {  get; set; }
        public int IdCabecera {  get; set; }
        public DateTime? FechaCambioEstado { get; set; }
        public string Estado { get; set; }
        public string? Observaciones { get; set; }

        public virtual MEC_CabeceraLiquidacion Cabecera { get; set; }
    }
}
