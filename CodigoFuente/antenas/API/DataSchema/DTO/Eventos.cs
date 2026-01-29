using System;

namespace API.DataSchema.DTO
{
    public class EventoCreateRequest
    {
        public short IdTipoEvento { get; set; }
        public DateTimeOffset FechaHora { get; set; }
        public string AnfitrionesTexto { get; set; } = null!;

        public short? IdIdioma { get; set; } // opcional; en Fase 1 default es-AR
        public string? Lugar { get; set; }
        public string? Direccion { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }

        public short? IdDressCode { get; set; }
        public string? DressCodeDescripcion { get; set; }

        public string? Saludo { get; set; }
        public string? MensajeBienvenida { get; set; }
        public string? Notas { get; set; }
    }

    public class EventoResponse
    {
        public long IdEvento { get; set; }
        public int IdTipoEvento { get; set; }
        public short IdIdioma { get; set; }
        public string AnfitrionesTexto { get; set; } = null!;
        public DateTimeOffset FechaHora { get; set; }
        public string? Lugar { get; set; }
        public string? Direccion { get; set; }
        public string Estado { get; set; } = null!;
        public DateTimeOffset FechaAlta { get; set; }
    }
}
