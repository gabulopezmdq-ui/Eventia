namespace API.DataSchema
{
    public class MEC_UsuariosEstablecimientos
    {
        public int IdUsuarioEstablecimiento {  get; set; }
        public int IdUsuario { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdCargo { get; set; }
        public string Vigente { get; set; }
    }
}
