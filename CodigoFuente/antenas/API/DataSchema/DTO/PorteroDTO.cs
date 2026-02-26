using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class PorteroResumenDTO
    {
        public long IdEvento { get; set; }

        public int TotalNinosConfirmados { get; set; }
        public int TotalRetirados { get; set; }
        public int TotalPendientes { get; set; }

        public decimal PorcentajeRetirado { get; set; }

        public List<ScanListItemDTO> UltimosScans { get; set; } = new();
    }
}
