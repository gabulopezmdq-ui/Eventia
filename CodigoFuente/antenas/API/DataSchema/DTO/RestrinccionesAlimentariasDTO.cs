using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class NinoAlimentacionUpdateDTO
    {
        public List<long> IdsRestricciones { get; set; } = new();
        public string? Detalle { get; set; }
    }

    public class RestriccionAlimDTO
    {
        public long IdRestriccionAlim { get; set; }
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public bool EsAlergia { get; set; }
        public short Severidad { get; set; }
        public bool RequiereAlerta { get; set; }
        public string? EtiquetaCorta { get; set; }
    }

    public class NinoAlertaStaffDTO
    {
        public long IdInvitadoNino { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string? ResponsableNombre { get; set; }
        public string? ResponsableApellido { get; set; }
        public string? ResponsableCelular { get; set; }

        public List<RestriccionAlimDTO> Alertas { get; set; } = new();
        public string? Detalle { get; set; } // alimentacion_detalle
        public short SeveridadMax { get; set; }
    }
}
