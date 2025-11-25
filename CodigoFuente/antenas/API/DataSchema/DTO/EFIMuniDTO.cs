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
        public string? CargoNombre { get; set; }
        public int? Legajo { get; set; }
        public int? Barra { get; set; }
        public string CodPlanta { get; set; }
        public string Caracter { get; set; }
        public string TipoDesig { get; set; }
    }

    public class EFIDocPOFDTO
    {
        public int LegajoEFI { get; set; } //legajo EFI
        public string? LegajoMEC { get; set; }
        public int Barra { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }
        public string NroDoc { get; set; }
        public string Cargo { get; set; }
        public string CodPlanta { get; set; }
        public string Caracter { get; set; }
        public string TipoDesig { get; set; }


        //MEC_POF
        public string Secuencia { get; set; }
        public string TipoCargo { get; set; }
    }

    public class ErroresTMPEFIDTO
    {
        public int IdTMPEFI { get; set; }
        public int IdCabecera { get; set; }
        public string Documento { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }
        public string LegajoEFI { get; set; }
        public string? LegajoMEC { get; set; }
        public string Secuencia { get; set; }
        public string TipoCargo { get; set; }
        public string UE { get; set; }
        public int? Barra { get; set; }
        public string? Estado { get; set; }
        public string? Cargo { get; set; }
        public string? Caracter { get; set; }
        public string? Funcion { get; set; }
        public int? CargoMEC { get; set; }
        public int? CaracterMEC { get; set; }

        public int HorasDesignadas { get; set; }
        public int IdCarRevista { get; set; }  
        public int IdTipoCategoria { get; set; }
    }

    public class CrearPOFRequest
    {
        public ErroresTMPEFIDTO Dto { get; set; }
        public int IdCarRevista { get; set; }
        public int IdCategoria { get; set; }
        public List<int> Barras { get; set; }
    }
}
