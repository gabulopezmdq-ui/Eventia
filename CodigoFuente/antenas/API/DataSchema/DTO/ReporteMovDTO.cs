using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class ReporteMovDTO
    {
        public class ReporteEstablecimientoDTO
        {
            // Establecimiento
            public int IdEstablecimiento { get; set; }
            public string NroDiegep { get; set; }
            public int IdTipoEstablecimiento { get; set; }
            public string NroEstablecimiento { get; set; }
            public string NombreMgp { get; set; }
            public string NombrePcia { get; set; }
            public string Ruralidad { get; set; }
            public string Subvencion { get; set; }
            public int? Mes { get; set; }
            public int? Anio { get; set; }
            public string? Area { get; set; }

            // ► Array con todos los docentes/movimientos
            public List<ReporteDocenteDTO> Docentes { get; set; } = new();
        }

        // ► Re‑usás tu ReporteMovDTO pero renombrado para claridad
        public class ReporteDocenteDTO
        {
            public int IdMovimientoDetalle { get; set; }
            public string NumDoc { get; set; }
            public string Apellido { get; set; }
            public string Nombre { get; set; }
            public string SitRevista { get; set; }
            public string Turno { get; set; }
            public string? Observaciones { get; set; }
            public int? AntigAnios { get; set; }
            public int? AntigMeses { get; set; }
            public int Horas { get; set; }
            public string Secuencia { get; set; }
            public string Funcion { get; set; }
            public string Categoria { get; set; }
            public string TipoMovimiento { get; set; }
            public string TipoDoc { get; set; }
        }

    }
}
