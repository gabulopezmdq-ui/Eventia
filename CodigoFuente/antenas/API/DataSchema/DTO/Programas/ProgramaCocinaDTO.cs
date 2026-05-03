using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaCocinaDiaDTO
    {
        public long IdEvento { get; set; }
        public DateOnly Fecha { get; set; }
        public string ServicioCodigo { get; set; } = "COMEDOR";
        public ProgramaCocinaResumenDTO Resumen { get; set; } = new();
        public List<ProgramaCocinaItemDTO> Items { get; set; } = new();
        public List<ProgramaCocinaTotalRestriccionDTO> TotalesPorRestriccion { get; set; } = new();
    }

    public class ProgramaCocinaResumenDTO
    {
        public int TotalComedor { get; set; }
        public int SinRestricciones { get; set; }
        public int ConRestricciones { get; set; }
        public int AlertasAltas { get; set; }
    }

    public class ProgramaCocinaItemDTO
    {
        public long IdInvitado { get; set; }
        public long IdRsvpGrupoIntegrante { get; set; }
        public string Participante { get; set; } = "";
        public string Responsable { get; set; } = "";
        public string? TelefonoResponsable { get; set; }
        public string Servicio { get; set; } = "";
        public List<ProgramaCocinaRestriccionDTO> Restricciones { get; set; } = new();
        public bool AlertaVisual { get; set; }
        public string NivelAlerta { get; set; } = "NORMAL";
        public string? ObservacionesSalud { get; set; }
    }

    public class ProgramaCocinaRestriccionDTO
    {
        public long IdRestriccionAlim { get; set; }
        public string Codigo { get; set; } = "";
        public string Texto { get; set; } = "";
        public string? Categoria { get; set; }
        public bool RequiereAlertaVisual { get; set; }
        public bool RequiereConfirmacionOrganizador { get; set; }
        public bool EsAlergeno { get; set; }
        public string? Observaciones { get; set; }
        public string? Severidad { get; set; }
    }

    public class ProgramaCocinaTotalRestriccionDTO
    {
        public string Codigo { get; set; } = "";
        public string Texto { get; set; } = "";
        public int Cantidad { get; set; }
        public bool AlertaVisual { get; set; }
    }
}