using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaCocinaDiaDTO
    {
        public long IdEvento { get; set; }
        public string Programa { get; set; } = "";
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

    public class ProgramaCocinaDetalleDTO
    {
        public long IdEvento { get; set; }
        public string Programa { get; set; } = "";
        public DateOnly Fecha { get; set; }
        public string ServicioCodigo { get; set; } = "";

        public ProgramaCocinaDetalleParticipanteDTO Participante { get; set; } = new();
        public ProgramaCocinaDetalleResponsableDTO Responsable { get; set; } = new();

        public List<ProgramaCocinaDetalleServicioDTO> ServiciosDelDia { get; set; } = new();
        public List<ProgramaCocinaRestriccionDTO> Restricciones { get; set; } = new();

        public ProgramaCocinaDetalleSaludDTO? Salud { get; set; }

        public bool AlertaVisual { get; set; }
        public string NivelAlerta { get; set; } = "NORMAL";
    }

    public class ProgramaCocinaDetalleParticipanteDTO
    {
        public long IdInvitado { get; set; }
        public long IdRsvpGrupoIntegrante { get; set; }
        public string NombreCompleto { get; set; } = "";
    }

    public class ProgramaCocinaDetalleResponsableDTO
    {
        public string NombreCompleto { get; set; } = "";
        public string? Telefono { get; set; }
        public string? Email { get; set; }
    }

    public class ProgramaCocinaDetalleServicioDTO
    {
        public string Codigo { get; set; } = "";
        public string Nombre { get; set; } = "";
    }

    public class ProgramaCocinaDetalleSaludDTO
    {
        public string? ObservacionesSalud { get; set; }
        public bool TieneProblemaMedico { get; set; }
        public string? ProblemaMedicoDetalle { get; set; }
        public bool TieneAlergiasNoAlimentarias { get; set; }
        public string? AlergiasNoAlimentariasDetalle { get; set; }
        public string? NecesidadEspecial { get; set; }
        public string? ObservacionesFamilia { get; set; }
    }
}