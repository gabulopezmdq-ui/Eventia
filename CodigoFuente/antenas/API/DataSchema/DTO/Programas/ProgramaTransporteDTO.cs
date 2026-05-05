using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaTransporteDiaDTO
    {
        public long IdEvento { get; set; }
        public string Programa { get; set; } = "";
        public DateOnly Fecha { get; set; }

        public ProgramaTransporteResumenDTO Resumen { get; set; } = new();

        public List<ProgramaTransporteItemDTO> Items { get; set; } = new();
    }

    public class ProgramaTransporteResumenDTO
    {
        public int Total { get; set; }
        public int ConObservaciones { get; set; }
        public int ConAlertasSalud { get; set; }
    }

    public class ProgramaTransporteItemDTO
    {
        public long IdInvitado { get; set; }
        public long IdRsvpGrupoIntegrante { get; set; }

        public string Participante { get; set; } = "";

        public string Responsable { get; set; } = "";
        public string? TelefonoResponsable { get; set; }

        public string Servicio { get; set; } = "";
        public string ServicioCodigo { get; set; } = "";

        public string? Direccion { get; set; }

        public string? ObservacionesServicio { get; set; }

        public bool TieneAlertaSalud { get; set; }

        public string? ObservacionesSalud { get; set; }
        
    }
}