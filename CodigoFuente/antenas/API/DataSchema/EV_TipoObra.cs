using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace rsAPIElevador.DataSchema
{
	public class EV_TipoObra
	{
        public int IdTipoObra { get; set; }
        public string Descripcion { get; set; }
		public DateTime? FechaAct { get; set; }
        public bool Activo { get; set; }

        public virtual ICollection<EV_Obra>? EV_Obra { get; set; } = new List<EV_Obra>(); // Collection navigation containing dependents


    }
}