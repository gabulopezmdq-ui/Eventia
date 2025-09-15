using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_MovimientosDetalle
    {
    
        public int IdMovimientoDetalle { get; set; }
        public int IdMovimientoCabecera { get; set; }
        public int? IdTipoFuncion { get; set; }
        public int? IdPOF { get; set; }
        public int? IdTipoCategoria { get; set; }
        public int? IdMotivoBaja { get; set; }
        public string TipoDoc { get; set; }
        public string TipoMovimiento { get; set; }
        public string NumDoc { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }
        public string SitRevista { get; set; }
        public string Turno { get; set; }
        public string? Observaciones { get; set; }
        public int? AntigAnios { get; set; }
        public int? AntigMeses { get; set; }
        public int? Horas { get; set; }
        public int? HorasDecrece { get; set; }
        public string? Decrece { get; set; }
        public DateTime? FechaInicioBaja { get; set; }
        public DateTime? FechaFinBaja { get; set; }
        public virtual MEC_MovimientosCabecera? MovimientoCabecera { get; set; }
        public virtual MEC_POF? POF { get; set; }
        public virtual MEC_TiposCategorias? TipoCategoria { get; set; }
        public virtual MEC_TiposFunciones? TipoFuncion { get; set; }
        public virtual MEC_MotivosBajasDoc? MotivosBajasDoc { get; set; }
    }
}
