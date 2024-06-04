///////////////////////////////////////////////////////////
//  EV_Conservadora.cs
//  Implementation of the Class EV_Conservadora
//  Created on:      18-oct.-2023 08:13:33
//  Original author: sebastianperez
///////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace rsAPIElevador.DataSchema {
	public class EV_Conservadora {
        public int IdConservadora { get; set; }
        public int? IdSeguro { get; set; }
        public string Nombre { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public int? IdCalle { get; set; }
        public int? Altura { get; set; }
		public int? CantOpe { get; set; }
		public string? Dto { get; set; }
		public string? Expediente { get; set; }
		public DateTime? FechaAct { get; set; }
		public bool Habilitado { get; set; }
        public bool Activo { get; set; }
		public DateTime? IniAct { get; set; }
        public virtual EV_Seguro? EV_Seguro { get; set; }    
        public virtual ICollection<EV_Maquina>? EV_Maquina { get; set; } = new List<EV_Maquina>(); // Collection navigation containing dependents
        public virtual ICollection<EV_Administracion>? EV_Administracion { get; set; } = new List<EV_Administracion>(); // Collection navigation containing dependents
        public virtual ICollection<EV_RepTecnico>? EV_RepTecnico { get; set; } = new List<EV_RepTecnico>(); // Collection navigation containing dependents


    }
}