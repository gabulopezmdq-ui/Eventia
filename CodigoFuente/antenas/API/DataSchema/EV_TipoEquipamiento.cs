using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsAPIElevador.DataSchema
{

    public class EV_TipoEquipamiento
    {
        public int IdTipoEquipamiento { get; set; }
        
        public string Descripcion { get; set; }
        public DateTime? FechaAct { get; set; }
        public bool Activo { get; set; }

        public ICollection<EV_Maquina>? EV_Maquina { get; set; } = new List<EV_Maquina>(); // Collection navigation containing dependents
    }
}