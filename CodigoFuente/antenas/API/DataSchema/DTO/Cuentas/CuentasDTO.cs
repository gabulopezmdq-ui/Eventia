using System;

namespace API.DataSchema.DTO.Cuentas
{
    public class CuentaResponseDTO
    {
        public long id_cuenta { get; set; }
        public string nombre_cuenta { get; set; }
        public string tipo { get; set; }
        public string estado { get; set; }
        public long? id_plan { get; set; }

        public string instagram { get; set; }
        public string web { get; set; }
        public string telefono { get; set; }
        public string ciudad { get; set; }
        public short? id_pais { get; set; }
        public short? id_tipo_identificacion_fiscal { get; set; }
        public string identificacion_fiscal { get; set; }
        public string descripcion { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }

    public class CuentaUpdateRequestDTO
    {
        public string nombre_cuenta { get; set; }
        public string tipo { get; set; }

        public string instagram { get; set; }
        public string web { get; set; }
        public string telefono { get; set; }
        public string ciudad { get; set; }
        public short? id_pais { get; set; }
        public short? id_tipo_identificacion_fiscal { get; set; }
        public string identificacion_fiscal { get; set; }
        public string descripcion { get; set; }
    }

    public class cuenta_solicitar_request
    {
        public string nombre_cuenta { get; set; }
        public string tipo { get; set; }

        public string instagram { get; set; }
        public string web { get; set; }
        public string telefono { get; set; }
        public string ciudad { get; set; }
        public short? id_pais { get; set; }
        public short? id_tipo_identificacion_fiscal { get; set; }
        public string identificacion_fiscal { get; set; }
        public string descripcion { get; set; }
    }

    public class cuenta_solicitar_response
    {
        public bool ok { get; set; }
        public string mensaje { get; set; }
        public long id_cuenta { get; set; }
        public string estado { get; set; }
    }
}
