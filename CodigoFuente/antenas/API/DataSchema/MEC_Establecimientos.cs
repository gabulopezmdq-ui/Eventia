using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_Establecimientos
    {
        public int IdEstablecimiento { get; set; }
        public string NroDiegep { get; set; }
        public int IdTipoEstablecimiento { get; set; }
        public string NroEstablecimiento { get; set; }
        public string NombreMgp { get; set; }
        public string NombrePcia { get; set; }
        public string Domicilio { get; set; }
        public string Telefono { get; set; }
        public string UE { get; set; }
        public string CantSecciones { get; set; }
        public string CantTurnos { get; set; }
        public string Ruralidad { get; set; }
        public string Subvencion { get; set; }
        public string Vigente { get; set; }
        public virtual MEC_TiposEstablecimientos? TipoEstablecimientos { get; set; }


    }
}
