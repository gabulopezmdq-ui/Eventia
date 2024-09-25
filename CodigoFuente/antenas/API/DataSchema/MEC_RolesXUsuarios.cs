using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema { 
public class MEC_RolesXUsuarios {
        
	public int IdRolXUsuario {  get; set; }
	public int IdRol {  get; set; }
	public int IdUsuario { get; set; }
    public virtual MEC_Usuarios Usuario { get; set; }
    public virtual MEC_Roles Rol { get; set; }

    }
}