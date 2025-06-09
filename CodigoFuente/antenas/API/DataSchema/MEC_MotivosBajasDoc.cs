using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_MotivosBajasDoc
    {
        public int IdMotivoBaja { get; set; }
        public string MotivoBaja { get; set; }
        public string Vigente { get; set; }
        public virtual ICollection<MEC_MovimientosBajas>? MovimientosBaja { get; set; } = new List<MEC_MovimientosBajas>();
    }
}
