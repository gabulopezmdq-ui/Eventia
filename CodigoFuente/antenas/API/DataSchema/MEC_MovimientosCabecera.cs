using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_MovimientosCabecera
    {
    
        public int IdMovimientoCabecera { get; set; }
        public int IdEstablecimiento { get; set; }
        public int? Mes { get; set; }
        public int? Anio { get; set; }
        public string? Area { get; set; }
        public DateTime? Fecha { get; set; }
        public string? Altas { get; set; }
        public string? Bajas { get; set; }
        public string? Modificaciones { get; set; }
        public string? Adicionales { get; set; }
        public string? Observaciones { get; set; }
        public string? Estado { get; set; }
        public virtual MEC_Establecimientos? Establecimientos { get; set; }
        public virtual ICollection<MEC_MovimientosDetalle>? MovimientosDetalle { get; set; }
    }
}
