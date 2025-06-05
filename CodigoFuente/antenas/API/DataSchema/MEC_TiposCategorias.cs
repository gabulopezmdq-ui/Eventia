using System.Collections.Generic;
using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class MEC_TiposCategorias : IRegistroUnico
    {
        public int IdTipoCategoria { get; set; }
        public string CodCategoria { get; set; }
        public string CodCategoriaMGP { get; set; }
        public string Descripcion { get; set; }
        public string Vigente { get; set; }

        public string[] UniqueProperties => new[] { "CodCategoria" }; //  CodCategoria es unico
        public virtual ICollection<MEC_POF>? POFs { get; set; } = new List<MEC_POF>();
        public virtual ICollection<MEC_UsuariosEstablecimientos>? UsuarioEstablecimiento { get; set; } = new List<MEC_UsuariosEstablecimientos>();
        public virtual ICollection<MEC_MovimientosDetalle>? MovimientosDetalle { get; set; }
    }
}
