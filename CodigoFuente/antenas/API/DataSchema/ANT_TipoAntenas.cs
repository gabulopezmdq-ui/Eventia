using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema { 
public class ANT_TipoAntenas {

	public int IdTipoAntena {  get; set; }
	public string Nombre { get; set; }
	public virtual ICollection<ANT_Antenas>? Antenas { get; set; } = new List<ANT_Antenas>();

    }
}