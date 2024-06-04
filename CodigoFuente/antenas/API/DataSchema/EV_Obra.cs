///////////////////////////////////////////////////////////
//  EV_Obra.cs
//  Implementation of the Class EV_Obra
//  Created on:      19-oct.-2023 09:26:48
//  Original author: sebastianperez
///////////////////////////////////////////////////////////

using System;
using System.Collections.Generic;
using System.Text;
using System.IO;



namespace rsAPIElevador.DataSchema {
	public class EV_Obra {

        public int IdObra { get; set; }
        public string Nombre { get; set; }
        public int? IdAdministacion { get; set; }
        public int? IdTipoObra { get; set; }
        public int? IdCalle { get; set; }
        public int? Altura { get; set; }
        public string? Expediente { get; set; }
		public DateTime? FechaAct { get; set; }
		public DateTime? FechaIns { get; set; }
		public DateTime? FechaLibro { get; set; }
		public int? Libro { get; set; }
		public string? Observaciones { get; set; }
        public bool Habilitado { get; set; }
        public bool Activo { get; set; }
        public virtual EV_Administracion? EV_Administracion { get; set; }
        
        public virtual EV_TipoObra? EV_TipoObra { get; set; }
        
        public virtual ICollection<EV_Maquina>? EV_Maquina { get; set; } = new List<EV_Maquina>(); // Collection navigation containing dependents
        public EV_Obra(){

		}

	}//end EV_Obra

}//end namespace rsAPIElevador.DataSchema