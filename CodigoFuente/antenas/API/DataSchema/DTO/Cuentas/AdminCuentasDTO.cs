using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class admin_cuenta_pendiente_dto
    {
        public long id_cuenta { get; set; }
        public string nombre_cuenta { get; set; }
        public string tipo { get; set; }
        public string estado { get; set; }

        public long id_usuario_owner { get; set; }
        public string email_owner { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
    }

    public class admin_aprobar_cuenta_request
    {
        public long id_cuenta { get; set; }
        public string codigo_plan { get; set; }
        public string observacion { get; set; }
    }

    public class admin_aprobar_cuenta_response
    {
        public bool ok { get; set; }
        public long id_cuenta { get; set; }
        public string estado { get; set; }
        public string codigo_plan { get; set; }
    }

    public class admin_suspender_cuenta_request
    {
        public long id_cuenta { get; set; }
        public string observacion { get; set; }
    }

    public class admin_suspender_cuenta_response
    {
        public bool ok { get; set; }
        public long id_cuenta { get; set; }
        public string estado { get; set; }
    }

    public class admin_cambiar_plan_request
    {
        public long id_cuenta { get; set; }
        public string codigo_plan_nuevo { get; set; }
        public string motivo { get; set; }
    }

    public class admin_cambiar_plan_response
    {
        public bool ok { get; set; }
        public long id_cuenta { get; set; }
        public string codigo_plan_anterior { get; set; }
        public string codigo_plan_nuevo { get; set; }
    }

    public class admin_reactivar_cuenta_request
    {
        public long id_cuenta { get; set; }
        public string observacion { get; set; }
    }

    public class admin_reactivar_cuenta_response
    {
        public bool ok { get; set; }
        public long id_cuenta { get; set; }
        public string estado { get; set; }
    }
}
