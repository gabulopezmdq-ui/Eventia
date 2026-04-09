using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class MesaCreateDTO
    {
        public long id_tramo { get; set; }
        public string nombre { get; set; } = null!;
        public int? capacidad { get; set; }
        public string? notas { get; set; }
    }

    public class MesaAsignarInvitadoDTO
    {
        public long id_mesa { get; set; }
        public long id_invitado { get; set; }
    }

    public class MesaInvitadoDetalleDTO
    {
        public long id_invitado { get; set; }
        public string nombre_completo { get; set; } = null!;
        public List<string> restricciones_alimentarias { get; set; } = new List<string>();
        public string? notas_restricciones { get; set; }
    }
}
