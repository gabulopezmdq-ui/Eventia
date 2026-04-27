using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class MesaRestriccionesDTO
    {
        public long IdMesa { get; set; }
        public string NombreMesa { get; set; }
        public string Tramo { get; set; }
        public List<InvitadoRestriccionReportDTO> Invitados { get; set; } = new();
    }

    public class InvitadoRestriccionReportDTO
    {
        public long IdInvitado { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public List<RestriccionReportItemDTO> Restricciones { get; set; } = new();
        public string? ObservacionesGenerales { get; set; } // De alimentacion_detalle
    }

    public class RestriccionReportItemDTO
    {
        public string Tipo { get; set; }
        public string? Observaciones { get; set; }
    }
}
