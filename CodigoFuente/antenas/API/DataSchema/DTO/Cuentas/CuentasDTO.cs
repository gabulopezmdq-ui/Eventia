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
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }

    public class CuentaUpdateRequestDTO
    {
        public string nombre_cuenta { get; set; }
        public string tipo { get; set; }
    }
}
