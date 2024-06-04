using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace rsAPIElevador.DataSchema
{

	public class EV_Velocidades
	{
		public int IdVelocidad {get;set;}
		public string Descripcion { get; set; }
        public DateTime? FechaAct { get; set; }
        public bool Activo { get; set; }
        public virtual ICollection<EV_Maquina>? EV_Maquina { get; set; } = new List<EV_Maquina>(); // Collection navigation containing dependents

    }

}