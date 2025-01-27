namespace API.DataSchema
{
    public class MEC_UsuariosEstablecimientos
    {
        public int IdUsuarioEstablecimiento {  get; set; }
        public int IdUsuario { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdTipoCategoria { get; set; }
        public string Vigente { get; set; }

        public virtual MEC_Usuarios? Usuario { get; set; }
        public virtual MEC_Establecimientos? Establecimiento { get; set; }
        public virtual MEC_TiposCategorias? Cargo { get; set; }
    }
}
