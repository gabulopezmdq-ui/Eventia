using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_MovimientosSuperCabecera
    {
        public int IdSuperCabecera { get; set; }

        public string Area { get; set; }
        public int Mes { get; set; }
        public int Anio { get; set; }

        public int IdEstablecimiento { get; set; }  
        public DateTime Fecha { get; set; }

        public virtual MEC_Establecimientos? Establecimiento { get; set; }
    }
}
