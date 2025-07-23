using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema
{
    public class MEC_InasistenciasRechazo
    {
        public int IdInasistenciaRechazo { get; set; }

        public int? UsuarioRechazo { get; set; }

        public int IdInasistenciaDetalle { get; set; }
        public string? MotivoRechazo { get; set; }

        public DateTime? FechaEnvio { get; set; }
        public MEC_Usuarios? Usuario { get; set; }
        public MEC_InasistenciasDetalle? InasistenciaDetalle { get; set; }
    }
}