using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_POF
    {
        public int IdPOF { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdPersona { get; set; }
        public int IdFuncion { get; set; }
        public int IdCarRevista { get; set; }
        public string Secuencia { get; set; }
        public string Barra { get; set; }
        public int IdCategoria { get; set; }
        public string TipoCargo { get; set; }
        public string Vigente { get; set; }

        // Propiedades de navegación
        public virtual MEC_Establecimientos? Establecimiento { get; set; }
        public virtual MEC_Personas? Persona { get; set; }
        public virtual MEC_TiposCategorias? Categoria { get; set; }
        public virtual MEC_CarRevista? CarRevista { get; set; }
        public virtual MEC_TiposFunciones? TipoFuncion { get; set; }

        public virtual ICollection<MEC_POF_Antiguedades>? POFAntiguedad { get; set; }
        public virtual ICollection<MEC_Mecanizadas>? Mecanizada { get; set; }
    }
}
