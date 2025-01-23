using Bogus.DataSets;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_POFDetalle
    {
        public int IdPOFDetalle { get; set; }
        public int IdPOF { get; set; }
        public int IdCabecera { get; set; }
        public int? CantHorasCS { get; set; }
        public int? CantHorasSS { get; set; }
        public int? AntiguedadAnios { get; set; }
        public int? AntiguedadMeses { get; set; }
        public string? SinHaberes { get; set; }
        public string? NoSubvencionado { get; set; }
        public int? SupleA { get; set; }
        public DateTime? SupleDesde { get; set; }
        public DateTime? SupleHasta { get; set; }

        // Propiedades de navegación
        public virtual MEC_POF? POF { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
        public virtual MEC_POF? Suplencia { get; set; }

    }
}
