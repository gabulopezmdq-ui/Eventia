using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionPagoListItemDTO
    {
        public long IdInscripcion { get; set; }
        public long? IdRsvpGrupo { get; set; }
        public string Responsable { get; set; } = "";
        public string? Email { get; set; }
        public string? Telefono { get; set; }
        public List<string> Participantes { get; set; } = new List<string>();
        public decimal TotalOriginal { get; set; }
        public decimal TotalDescuentos { get; set; }
        public decimal TotalRecargos { get; set; }
        public decimal TotalAPagar { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal Saldo { get; set; }
        public string Moneda { get; set; } = "";
        public string EstadoPago { get; set; } = "";
    }

    public class ProgramaInscripcionEstadoPagoDTO : ProgramaInscripcionPagoListItemDTO
    {
        public List<ProgramaInscripcionDetallePeriodoDTO> Periodos { get; set; } = new List<ProgramaInscripcionDetallePeriodoDTO>();
        public List<ProgramaInscripcionDetalleServicioDTO> Servicios { get; set; } = new List<ProgramaInscripcionDetalleServicioDTO>();
        public List<ProgramaInscripcionAjusteDTO> Ajustes { get; set; } = new List<ProgramaInscripcionAjusteDTO>();
        public List<ProgramaInscripcionPagoDTO> Pagos { get; set; } = new List<ProgramaInscripcionPagoDTO>();
    }

    public class ProgramaInscripcionDetallePeriodoDTO
    {
        public string Participante { get; set; } = "";
        public string Nombre { get; set; } = "";
        public DateOnly FechaDesde { get; set; }
        public DateOnly FechaHasta { get; set; }
        public decimal PrecioBase { get; set; }
        public string Moneda { get; set; } = "";
    }

    public class ProgramaInscripcionDetalleServicioDTO
    {
        public string Participante { get; set; } = "";
        public string Codigo { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string TipoCalculo { get; set; } = "";
        public decimal Precio { get; set; }
        public decimal Subtotal { get; set; }
        public string Moneda { get; set; } = "";
    }

    public class ProgramaInscripcionAjusteDTO
    {
        public long IdInscripcionAjuste { get; set; }
        public string Tipo { get; set; } = "";
        public short IdTipoAjuste { get; set; }
        public string TipoAjusteCodigo { get; set; } = "";
        public string TipoAjusteTexto { get; set; } = "";
        public string? Descripcion { get; set; }
        public decimal Importe { get; set; }
        public string Moneda { get; set; } = "";
        public bool Activo { get; set; }
        public DateTimeOffset FechaAlta { get; set; }
    }

    public class ProgramaInscripcionPagoDTO
    {
        public long IdInscripcionPago { get; set; }
        public DateTimeOffset FechaPago { get; set; }
        public decimal Importe { get; set; }
        public string Moneda { get; set; } = "";
        public string MedioPago { get; set; } = "";
        public string? Referencia { get; set; }
        public string? Observaciones { get; set; }
        public bool Anulado { get; set; }
    }

    public class ProgramaInscripcionCrearAjusteRequest
    {
        public string Tipo { get; set; } = null!;
        public short IdTipoAjuste { get; set; }
        public decimal Importe { get; set; }
        public string? Moneda { get; set; }
        public string? Descripcion { get; set; }
    }

    public class ProgramaInscripcionRegistrarPagoRequest
    {
        public decimal Importe { get; set; }
        public string? Moneda { get; set; }
        public string MedioPago { get; set; } = null!;
        public string? Referencia { get; set; }
        public string? Observaciones { get; set; }
    }

    public class ProgramaInscripcionOperacionPagoResponse
    {
        public bool Ok { get; set; }
        public long IdInscripcion { get; set; }
        public decimal TotalOriginal { get; set; }
        public decimal TotalDescuentos { get; set; }
        public decimal TotalRecargos { get; set; }
        public decimal TotalAPagar { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal Saldo { get; set; }
        public string EstadoPago { get; set; } = "";
    }
}