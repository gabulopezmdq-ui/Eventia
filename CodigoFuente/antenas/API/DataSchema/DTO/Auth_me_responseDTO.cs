using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class Auth_me_responseDTO
    {
        public usuario_me usuario { get; set; }
        public List<string> roles_globales { get; set; }
        public cuenta_me cuenta { get; set; }
        public eventos_me eventos { get; set; }
        public ui_me ui { get; set; }
    }

    public class usuario_me
    {
        public long id_usuario { get; set; }
        public string email { get; set; }
    }

    public class cuenta_me
    {
        public string estado_ui { get; set; } // SIN_CUENTA / CUENTA_PENDIENTE / CUENTA_ACTIVA / CUENTA_SUSPENDIDA

        public long? id_cuenta { get; set; }
        public string nombre_cuenta { get; set; }
        public string tipo { get; set; }
        public string estado { get; set; }

        public long? id_plan { get; set; }
        public string plan_codigo { get; set; }

        public string rol_cuenta { get; set; }
        public bool? vinculo_activo { get; set; }
    }

    public class eventos_me
    {
        public int cantidad_propios { get; set; }
        public int cantidad_compartidos { get; set; }
    }

    public class ui_me
    {
        public bool mostrar_solicitar_cuenta { get; set; }
        public bool mostrar_estado_cuenta_pendiente { get; set; }
        public bool mostrar_menu_cuenta { get; set; }
        public bool mostrar_admin { get; set; }
        public bool puede_crear_evento_b2c { get; set; }
    }
}