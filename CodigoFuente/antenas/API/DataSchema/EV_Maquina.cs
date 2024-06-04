///////////////////////////////////////////////////////////
//  EV_Maquina.cs
//  Implementation of the Class EV_Maquina
//  Created on:      19-oct.-2023 10:18:50
//  Original author: sebastianperez
///////////////////////////////////////////////////////////

using System;
using System.Collections.Generic;
using System.Text;
using System.IO;



namespace rsAPIElevador.DataSchema {
	public class EV_Maquina {

        public int IdMaquina { get; set; }
        public int? IdTipoEquipamiento { get; set; }
        public int? IdVelocidadXMaquina { get; set; }
        public int? IdObra{ get; set; }
        public int? IdConservadora { get; set; }
        public int? IdVelocidad { get; set; }
        public int? IdRepTecnico { get; set; }
        public string? CapacidadCarga { get; set; }
		public DateTime? FechaFabricacion { get; set; }
        public DateTime? FechaAct { get; set; }
        public int? Metros { get; set; }
		public string? Modelo { get; set; }
		public string? NroSerie { get; set; }
		public string? Observaciones { get; set; }
		public int? Paradas { get; set; }
        public bool Habilitado { get; set; }
        public bool Activo { get; set; }
		public EV_TipoEquipamiento? EV_TipoEquipamiento { get; set; }
        public virtual EV_Obra? EV_Obra { get; set; }

         public virtual EV_Conservadora? EV_Conservadora { get; set; }

        public virtual EV_Velocidades? EV_Velocidades { get; set; }

        public virtual EV_RepTecnico? EV_RepTecnico { get; set; }

        public EV_Maquina(){

		}

	}//end EV_Maquina

}//end namespace rsAPIElevador.DataSchema