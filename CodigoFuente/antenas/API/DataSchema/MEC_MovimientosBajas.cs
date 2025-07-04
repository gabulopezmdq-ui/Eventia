using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_MovimientosBajas
    {
    
        public int IdMovimientoBaja { get; set; }
        public int? IdEstablecimiento { get; set; }
        public int? IdTipoEstablecimiento { get; set; }
        public int? IdPOF { get; set; }
        public int? IdMotivoBaja { get; set; }
        public int? Anio { get; set; }
        public string? SuplenteDNI { get; set; }
        public string? SuplenteApellido { get; set; }
        public string? SuplenteNombre { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public int? CantHoras { get; set; }
        public string? Estado { get; set; }
        public string? Ingreso { get; set; }
        public string? IngresoDescripcion { get; set; }
        public string? Observaciones { get; set; }
        public virtual MEC_TiposEstablecimientos? TipoEstablecimiento { get; set; }
        public virtual MEC_POF? POF { get; set; }
        public virtual MEC_Establecimientos? Establecimiento { get; set; }
        public virtual MEC_MotivosBajasDoc? MotivoBajaDoc { get; set; }
    }
}
