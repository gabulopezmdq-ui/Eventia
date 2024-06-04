///////////////////////////////////////////////////////////
//  RV_Administracion.cs
//  Implementation of the Class RV_Administracion
//  Created on:      17-oct.-2023 14:39:41
//  Original author: sebastianperez
///////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using Microsoft.Extensions.Hosting;

namespace rsAPIElevador.DataSchema {
	public class EV_Administracion {
        public int IdAdministracion { get; set; }
        public string Nombre { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public int? IdCalle { get; set; }
        public int? Altura { get; set; }
		public string? Dto { get; set; }
		public DateTime? FechaAct { get; set; }
		public  bool Habilitado { get; set; }
        public bool Activo { get; set; }
        
        public virtual ICollection<EV_Obra>? EV_Obra { get; set; } = new List<EV_Obra>(); // Collection navigation containing dependents
        
        public virtual ICollection<EV_Conservadora>? EV_Conservadora { get; set; } = new List<EV_Conservadora>(); // Collection navigation containing dependents
    }
}