///////////////////////////////////////////////////////////
//  EV_RepTecnico.cs
//  Implementation of the Class EV_RepTecnico
//  Created on:      17-oct.-2023 13:33:18
//  Original author: sebastianperez
///////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;



namespace rsAPIElevador.DataSchema {
	public class EV_RepTecnico {

        public int IdRepTecnico { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public int? IdCalle { get; set; }
        public int? Altura { get; set; }
        public string? MatProf { get; set; }
        public string? MatMuni { get; set; }
        public DateTime? FechaAct { get; set; }
        public bool Habilitado { get; set; }
        public bool Activo { get; set; }
        public virtual ICollection<EV_Maquina>? EV_Maquina { get; set; } = new List<EV_Maquina>(); // Collection navigation containing dependents
        public virtual ICollection<EV_Conservadora>? EV_Conservadora { get; set; } = new List<EV_Conservadora>(); // Collection navigation containing dependents

    }

}