using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class MEC_Personas : IEntidadUnica
    {
        public int IdPersona {  get; set; }
        public string DNI { get; set; }
        public string Apellido { get; set; }
        public string Nombre {  get; set; }
        public string Legajo { get; set; }
        public string Vigente { get; set; }
        public IEnumerable<string[]> PropUnica => new[]
   {
        new[] { "DNI" },
        new[] { "Legajo" }
    };
    }
}
