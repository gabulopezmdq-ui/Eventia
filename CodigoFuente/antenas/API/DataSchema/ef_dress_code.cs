using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_dress_code : IRegistroUnico
    {
        public short id_dress_code { get; set; }
        public string descripcion { get; set; } = null!;
        public bool activo { get; set; }

        public string[] UniqueProperties => new[] { "descripcion" };
    }   
}
