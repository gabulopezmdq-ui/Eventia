using System;
using System.Collections.Generic;
using API.DataSchema.Interfaz;
using System.Text;
using System.IO;

namespace API.DataSchema
{
    public class MEC_CarRevista : IRegistroUnico
    {
        public int IdCarRevista {  get; set; }
        public string CodPcia { get; set; }
        public string Descripcion {  get; set; }
        public string CodMgp { get; set; }
        public string Vigente { get; set; }
        public string[] UniqueProperties => new[] { "CodMGP", "CodPcia" }; //  CodCategoria es unico
    }
}
