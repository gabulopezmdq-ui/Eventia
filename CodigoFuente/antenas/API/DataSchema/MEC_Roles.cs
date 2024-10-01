using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema { 
public class MEC_Roles {

	public int IdRol {  get; set; }
	public string NombreRol { get; set; }
        public string Vigente { get; set; }
        public virtual ICollection<MEC_RolesXUsuarios> RolesXUsuarios { get; set; } = new List<MEC_RolesXUsuarios>();
    }
}