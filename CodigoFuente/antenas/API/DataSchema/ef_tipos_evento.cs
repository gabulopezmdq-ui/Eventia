using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_tipos_evento : IRegistroUnico
    {
        public int id_tipo_evento { get; set; }
        public string descripcion { get; set; } = null!;
        public bool activo { get; set; }

        public string[] UniqueProperties => new[] { "descripcion" };
    }   
}
