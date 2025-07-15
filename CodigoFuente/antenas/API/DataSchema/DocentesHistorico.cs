using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class DocenteHistorico
    {
        public int Dni { get; set; }
        public int NroLegajo { get; set; }
        public int NroCargo { get; set; }
        public string CodDepend { get; set; }
        public int CodGrupo { get; set; }
        public int CodNivel { get; set; }
        public int Modulo { get; set; }
        public int Cargo { get; set; }
        public DateTime FechaIngreso { get; set; }
        public int CodLicen { get; set; }
        public int Cantidad { get; set; }
        public int Horas { get; set; }
    }
}