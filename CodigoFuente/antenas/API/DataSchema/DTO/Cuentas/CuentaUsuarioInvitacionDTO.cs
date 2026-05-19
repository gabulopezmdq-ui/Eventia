namespace API.DataSchema.DTO.Cuentas
{
    public class CuentaUsuarioInvitarRequestDTO
    {
        public string email { get; set; } = null!;
        public string rol_codigo { get; set; } = null!;
    }

    public class CuentaUsuarioInvitarResponseDTO
    {
        public bool ok { get; set; }
        public string url_invitacion { get; set; } = null!;
        public string email_invitado { get; set; } = null!;
        public string rol_codigo { get; set; } = null!;
    }

    public class CuentaUsuarioValidarInvitacionResponseDTO
    {
        public bool valida { get; set; }
        public string? mensaje { get; set; }
        public string? nombre_cuenta { get; set; }
        public string? email_invitado { get; set; }
        public string? rol_codigo { get; set; }
    }

    public class CuentaUsuarioAceptarInvitacionRequestDTO
    {
        public string token { get; set; } = null!;
    }

    public class CuentaUsuarioAceptarInvitacionResponseDTO
    {
        public bool ok { get; set; }
        public string mensaje { get; set; } = null!;
        public long id_cuenta { get; set; }
        public string nombre_cuenta { get; set; } = null!;
        public string rol_codigo { get; set; } = null!;
    }

    public class CuentaUsuarioCambiarRolRequestDTO
    {
        public long id_cuenta_usuario { get; set; }
        public string rol_codigo { get; set; } = null!;
    }

    public class CuentaUsuarioOperacionResponseDTO
    {
        public bool ok { get; set; }
        public string mensaje { get; set; } = null!;
    }

}