using System;
using System.ComponentModel.DataAnnotations;

namespace API.DataSchema.DTO.Cuentas
{
    public class CuentaResponseDTO
    {
        public long id_cuenta { get; set; }

        public string nombre_cuenta { get; set; } = null!;
        public string tipo { get; set; } = null!;
        public string estado { get; set; } = null!;
        public long? id_plan { get; set; }

        public string? instagram { get; set; }
        public string? web { get; set; }
        public string telefono { get; set; } = null!;
        public string ciudad { get; set; } = null!;
        public short id_pais { get; set; }
        public short? id_tipo_identificacion_fiscal { get; set; }
        public string? identificacion_fiscal { get; set; }
        public string? descripcion { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }

    public class CuentaUpdateRequestDTO
    {
        [Required]
        public string nombre_cuenta { get; set; } = null!;

        [Required]
        public string tipo { get; set; } = null!;

        public string? instagram { get; set; }
        public string? web { get; set; }

        [Required]
        public string telefono { get; set; } = null!;

        [Required]
        public string ciudad { get; set; } = null!;

        public short id_pais { get; set; }
        public short? id_tipo_identificacion_fiscal { get; set; }
        public string? identificacion_fiscal { get; set; }
        public string? descripcion { get; set; }
    }

    public class cuenta_solicitar_request
    {
        [Required]
        public string nombre_cuenta { get; set; } = null!;

        [Required]
        public string tipo { get; set; } = null!;

        public string? instagram { get; set; }
        public string? web { get; set; }

        [Required]
        public string telefono { get; set; } = null!;

        [Required]
        public string ciudad { get; set; } = null!;

        public short id_pais { get; set; }
        public short? id_tipo_identificacion_fiscal { get; set; }
        public string? identificacion_fiscal { get; set; }
        public string? descripcion { get; set; }
    }

    public class cuenta_solicitar_response
    {
        public bool ok { get; set; }
        public string mensaje { get; set; } = null!;
        public long id_cuenta { get; set; }
        public string estado { get; set; } = null!;
    }
}