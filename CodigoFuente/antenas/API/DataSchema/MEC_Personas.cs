using System;
using System.Collections.Generic;
using API.DataSchema.Interfaz;
using System.Text;
using System.IO;

namespace API.DataSchema
{
    public class MEC_Personas : IRegistroUnico
    {
        public int IdPersona {  get; set; }
        public string DNI { get; set; }
        public string Apellido { get; set; }
        public string Nombre {  get; set; }
        public string? Legajo { get; set; }
        public string Vigente { get; set; }
        public string[] UniqueProperties => new[] { "DNI", "Legajo" }; //  CodCategoria es unico
        public virtual ICollection<MEC_POF>? POFs { get; set; } = new List<MEC_POF>();
        public virtual ICollection<MEC_POF_Antiguedades>? POFAntiguedad { get; set; }
    }
}
