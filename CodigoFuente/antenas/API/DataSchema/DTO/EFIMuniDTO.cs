using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class EFIMuniDTO
    {
        public string Nombre { get; set; }
        public int NroDoc { get; set; }
        public int? CargoNombre { get; set; }
        public string? CodPlanta { get; set; }
        public string? CaracterDescripcion { get; set; }
        public string? TipoDesigDescripcion { get; set; }
    }
    public class DocenteDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public int NroDoc { get; set; }
        public int? Cargo { get; set; }
        public int? Legajo { get; set; }
        public int? Barra { get; set; }
        public string CodPlanta { get; set; }
        public string Caracter { get; set; }
        public string TipoDesig { get; set; }
    }
}
