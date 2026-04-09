using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_mesas
    {
        public long id_mesa { get; set; }
        public long id_tramo { get; set; }
        
        public string nombre { get; set; } = null!;
        public int? capacidad { get; set; }
        public string? notas { get; set; }
        
        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        // Nav
        public ef_evento_tramos tramo { get; set; } = null!;
        public ICollection<ef_evento_mesa_invitados> mesa_invitados { get; set; } = new List<ef_evento_mesa_invitados>();
    }
}
